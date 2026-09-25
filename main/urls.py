from django.urls import path
from .views import home_page_view, add_to_cart, cart_page_view, update_cart_quantity, remove_from_cart

urlpatterns = [
    path('', home_page_view, name='home'),
    path('add-to-cart/', add_to_cart, name='add_to_cart'),
    path('cart/', cart_page_view, name='cart'),
    path('update-cart-quantity/', update_cart_quantity, name='update_cart_quantity'),
    path('remove-from-cart/', remove_from_cart, name='remove_from_cart'),
]