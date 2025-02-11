from django.contrib import admin

from .models import Product,Color,Wishlist

class Productadmin(admin.ModelAdmin):
    list_display = ["id","name", "quantity", "price", "seller__username"]


admin.site.register(Product, Productadmin)


admin.site.register(Color)
admin.site.register(Wishlist)