from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User



def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(username)
        print(password)

        user = authenticate(
            request=request,
            username=username,
            password=password
        )

        if user is  None:
            return redirect('auth_user_app:login_page')

        login(request, user)
        print("Login qilindi")
        return redirect('main:home_page')

    
    return render(request, 'login.html')

def logout_view(request):
    logout(request),
    return redirect("auth_user_app:login_page")



def register_user(request):

    if request.method == "POST":
        full_name = request.POST.get('full_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if password != confirm_password:
            messages.error(request, 'Password bilan confirm password mos emas')
            return redirect('main:home_page')

        user = User.objects.create_user(
            first_name = full_name,
            username = username,
            email = email,
            password = password
        )

        return redirect('main:home_page')

    return render(request, 'register.html')