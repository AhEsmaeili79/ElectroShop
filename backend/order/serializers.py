# serializers.py
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(
        source="product.main_photo", read_only=True
    )  # Assuming the product has an image field
    product_price = serializers.IntegerField(source="product.price", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "product_price",
            "quantity",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "order_code",
            "shipment_price",
            "total_price",
            "address",
            "payment_type",
            "status",
            "created_at",
            "items",
        ]
        read_only_fields = [
            "user",
            "order_code",
            "shipment_price",
            "status",
            "created_at",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")  # Extract items data
        order = Order.objects.create(**validated_data)  # Create the order instance

        # Create OrderItem instances for each item
        for item_data in items_data:
            OrderItem.objects.create(
                order=order, **item_data
            )  # Link each item to the order

        return order
