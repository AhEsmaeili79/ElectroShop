# product/models.py
from django.db import models
from django.conf import settings
from category.models import Category

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.PositiveIntegerField(blank=False)
    quantity = models.IntegerField(blank=False)
    model = models.CharField(max_length=255)
    is_favorited_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="favorite_products", blank=True
    )
    main_photo = models.ImageField(upload_to="products/%Y/%m/%d/", blank=False)
    photo1 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    photo2 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    photo3 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    photo4 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category,on_delete=models.PROTECT)

    def __str__(self):
        return (
            f"ProductName: {self.name}, Count: {self.quantity}, Seller: {self.seller}"
        )
