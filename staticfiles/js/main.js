/* ==========================================================================
   Shop front end — shared interactivity
   Scope, intentionally small:
   1. Light / dark theme toggle (persisted)
   2. Modal open/close (quick-view product modal)
   3. Toast messages: auto-shows any server-rendered .toast on load,
      auto-hides after a delay, and exposes window.showToast() for
      client-side use (e.g. instant feedback before the form submit
      response comes back).
   4. Small conveniences: quantity steppers, mobile nav toggle,
      password visibility toggle — none of it touches form submission,
      every form still posts normally to Django.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------- Theme toggle ---------------- */
  var THEME_KEY = 'shop-theme';

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      var isDark = theme === 'dark' ||
        (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }
    applyTheme(saved);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        if (!current) {
          current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
      });
    });
  }

  /* ---------------- Mobile nav ---------------- */
  function initNavToggle() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------------- Modals ---------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.removeAttribute('aria-hidden');
    var focusTarget = modal.querySelector('[data-autofocus]') || modal.querySelector('button, a, input');
    if (focusTarget) focusTarget.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals() {
    document.querySelectorAll('[data-open-modal]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var id = trigger.getAttribute('data-open-modal');
        var modal = document.getElementById(id);
        openModal(modal);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (evt) {
        if (evt.target === backdrop) closeModal(backdrop);
      });
      backdrop.querySelectorAll('[data-close-modal]').forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal(backdrop); });
      });
    });

    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.is-open').forEach(closeModal);
      }
    });
  }

  /* ---------------- Toasts ---------------- */
  var TOAST_DURATION = 4500;

  function dismissToast(el) {
    if (!el || el.classList.contains('is-leaving')) return;
    el.classList.add('is-leaving');
    el.addEventListener('animationend', function () {
      el.remove();
    }, { once: true });
  }

  function wireToast(el) {
    var closeBtn = el.querySelector('.toast__close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dismissToast(el); });
    window.setTimeout(function () { dismissToast(el); }, TOAST_DURATION);
  }

  function initServerToasts() {
    /* Any .toast elements already in the page (rendered server-side from
       Django's messages framework) get wired up and auto-dismissed. */
    document.querySelectorAll('.toast-container .toast').forEach(wireToast);
  }

  /* Public helper for client-triggered feedback, e.g.:
       showToast('Added to cart', 'success')
     type: 'success' | 'error' | 'info' */
  window.showToast = function (message, type) {
    var container = document.querySelector('.toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast__close';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.textContent = '\u00D7';
    toast.appendChild(closeBtn);

    container.appendChild(toast);
    wireToast(toast);
  };

  /* ---------------- Quantity steppers (cart & quick-view) ---------------- */
  function initQtySteppers() {
    document.querySelectorAll('.qty-form').forEach(function (form) {
      var input = form.querySelector('input[type="number"]');
      var minus = form.querySelector('[data-qty-minus]');
      var plus = form.querySelector('[data-qty-plus]');
      if (!input) return;
      var min = parseInt(input.min, 10) || 1;
      var max = parseInt(input.max, 10) || 99;

      if (minus) minus.addEventListener('click', function () {
        var val = Math.max(min, (parseInt(input.value, 10) || min) - 1);
        input.value = val;
        input.dispatchEvent(new Event('change'));
      });
      if (plus) plus.addEventListener('click', function () {
        var val = Math.min(max, (parseInt(input.value, 10) || min) + 1);
        input.value = val;
        input.dispatchEvent(new Event('change'));
      });
    });
  }

  /* ---------------- Password visibility ---------------- */
  function initPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
      var wrapper = btn.closest('.password-field');
      var input = wrapper ? wrapper.querySelector('input') : null;
      if (!input) return;
      btn.addEventListener('click', function () {
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.textContent = showing ? 'Show' : 'Hide';
      });
    });
  }

  /* ---------------- Category chip visual state ----------------
     Chips are plain links (?category=slug) so filtering works with
     no JS/Django template logic required; this only mirrors the
     pressed state instantly on click for a snappier feel. */
  function initCategoryChips() {
    document.querySelectorAll('[data-chip-group] .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('[data-chip-group] .chip').forEach(function (c) {
          c.setAttribute('aria-pressed', 'false');
        });
        chip.setAttribute('aria-pressed', 'true');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavToggle();
    initModals();
    initServerToasts();
    initQtySteppers();
    initPasswordToggles();
    initCategoryChips();
  });
})();
