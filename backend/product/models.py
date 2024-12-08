from django.db import models
from django.conf import settings
from category.models import Category , Brand
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils import timezone

class Color(models.Model):
    color_hex = models.CharField(max_length=255, default='#fff')
    
    def __str__(self):
        return f"Color: {self.color_hex}"


class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.PositiveIntegerField(blank=False)
    quantity = models.IntegerField(blank=False)
    model = models.CharField(max_length=255)
    desc = models.TextField(null=True)
    is_favorited_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="favorite_products", blank=True
    )
    main_photo = models.ImageField(upload_to="products/%Y/%m/%d/", blank=False)
    photo1 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    photo2 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    photo3 = models.ImageField(upload_to="products/%Y/%m/%d/", blank=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    colors = models.ManyToManyField(Color, related_name="products", blank=True)
    brand = models.ForeignKey(Brand,on_delete=models.CASCADE,default=1, related_name="products")

    def __str__(self):
        return f"ProductName: {self.name}, Count: {self.quantity}, Seller: {self.seller}"

    def save(self, *args, **kwargs):
        # Resize all the images before saving
        if self.main_photo:
            self.main_photo = self.resize_image(self.main_photo)
        if self.photo1:
            self.photo1 = self.resize_image(self.photo1)
        if self.photo2:
            self.photo2 = self.resize_image(self.photo2)
        if self.photo3:
            self.photo3 = self.resize_image(self.photo3)
            
        super(Product, self).save(*args, **kwargs)

    def resize_image(self, image_field):
        # Open the image
        img = Image.open(image_field)

        # If the image has an alpha channel (RGBA), convert it to RGB
        if img.mode == 'RGBA':
            img = img.convert('RGB')

        # Resize the image
        img = img.resize((500, 500), Image.Resampling.LANCZOS)

        # Save it into a BytesIO object to convert it back to an InMemoryUploadedFile
        img_io = BytesIO()
        img.save(img_io, format='JPEG')
        img_io.seek(0)

        # Generate the file name
        image_field_name = image_field.name.split('/')[-1]

        # Return the image as an InMemoryUploadedFile
        image_file = InMemoryUploadedFile(
            img_io, None, image_field_name, 'image/jpeg', img_io.tell(), None
        )

        return image_file


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'product')  # Prevents adding the same product to the wishlist multiple times

    def __str__(self):
        return f"{self.user} - {self.product.name} Wishlist"
