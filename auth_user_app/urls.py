from django.urls import path
from .views import login_view, logout_view, register_user

app_name = 'auth_user_app'

urlpatterns = [
    path('login/', login_view, name='login_page'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_user, name='register_user_page')
]