from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    category_name = models.CharField(max_length=100)
    data_created = models.DateTimeField(auto_now_add=True)
    data_edited = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.category_name

class Products(models.Model):
    product_name = models.CharField(max_length=250)
    product_decriptiom = models.TextField()

    product_price_new = models.FloatField(default= 0)
    product_price_old = models.FloatField(default= 0)
    base_price = models.FloatField(default= 0)

    image = models.ImageField(upload_to='product_images')

    category = models.ForeignKey('Category', on_delete=models.CASCADE)

    data_created = models.DateTimeField(auto_now_add=True)
    data_edited = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} - {self.product.product_name}"