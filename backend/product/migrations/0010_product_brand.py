# Generated by Django 5.1.2 on 2024-12-08 18:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0005_category_image'),
        ('product', '0009_product_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='brand',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='products', to='category.brand'),
        ),
    ]
