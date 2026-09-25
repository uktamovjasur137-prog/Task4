from django.shortcuts import render, redirect
from .models import Products, Category


def home_page_view(request):
    category_id = request.GET.get('category')
    categories = Category.objects.all()
    products = Products.objects.all()

    if category_id:
        products = products.filter(category_id=category_id)

    context = {
        'products': products,
        'categories': categories,
        'active_category': int(category_id) if category_id else None,
    }
    return render(request, 'index.html', context)

def add_to_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))

        cart = request.session.get('cart', {})
        cart[product_id] = cart.get(product_id, 0) + quantity
        request.session['cart'] = cart
        request.session.modified = True

    return redirect('home')

def cart_page_view(request):
    cart = request.session.get('cart', {})
    products = Products.objects.filter(id__in=cart.keys())

    cart_items = []
    total = 0
    for product in products:
        qty = cart[str(product.id)]
        subtotal = product.product_price_new * qty
        total += subtotal
        cart_items.append({'product': product, 'quantity': qty, 'subtotal': subtotal})

    return render(request, 'cart_page.html', {'cart_items': cart_items, 'total': total})

def update_cart_quantity(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))

        cart = request.session.get('cart', {})
        if quantity < 1:
            cart.pop(product_id, None)
        else:
            cart[product_id] = quantity
        request.session['cart'] = cart
        request.session.modified = True

    return redirect('cart')


def remove_from_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        cart = request.session.get('cart', {})
        cart.pop(product_id, None)
        request.session['cart'] = cart
        request.session.modified = True

    return redirect('cart')