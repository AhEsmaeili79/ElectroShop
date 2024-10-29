from django.contrib import admin

from .models import Product


# Register your models here.
class Productadmin(admin.ModelAdmin):
    list_display = ["name", "quantity", "price", "seller__username"]


admin.site.register(Product, Productadmin)
