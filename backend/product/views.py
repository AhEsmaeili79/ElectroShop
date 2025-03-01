from rest_framework import viewsets, permissions
from .models import Product, Wishlist, Color, ProductColorQuantity
from rest_framework.decorators import action
from rest_framework import serializers
from rest_framework.response import Response
from category.models import Category
from .serializers import ProductSerializer, WishlistSerializer, ColorSerializer, ProductColorQuantitySerializer
from .Permissions.permissions import IsSellerOrReadOnly
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied
User = get_user_model()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "seller" or user.role == "admin":
            return Product.objects.filter(seller=user)
        return Product.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated and user.role == "seller" or user.role == "admin":
            category_id = self.request.data.get('category')
            if category_id:
                category = Category.objects.get(id=category_id)
                serializer.save(seller=user, category=category)
            else:
                raise serializers.ValidationError("Category is required.")


class CustomerProductViewSet(viewsets.ReadOnlyModelViewSet): 
    serializer_class = ProductSerializer
    permission_classes = [] 
    
    def get_queryset(self):
        queryset = Product.objects.all() 

        category_ids = self.request.query_params.get('category', '')
        if category_ids:
            category_ids_list = category_ids.split(',')  
            category_ids_list = [int(id.replace('category-', '')) for id in category_ids_list]
            queryset = queryset.filter(category__id__in=category_ids_list)

        brand_ids = self.request.query_params.get('brand', '')
        if brand_ids:
            brand_ids_list = brand_ids.split(',')
            brand_ids_list = [int(id.replace('brand-', '')) for id in brand_ids_list]
            queryset = queryset.filter(brand__id__in=brand_ids_list)

        queryset = Product.objects.all()

        color_ids = self.request.query_params.get('color', '')
        if color_ids:
            color_ids_list = color_ids.split(',')
            color_ids_list = [int(id.replace('color-', '')) for id in color_ids_list]
            queryset = queryset.filter(
                productcolorquantity__color__id__in=color_ids_list,
                productcolorquantity__quantity__gt=0
            ).distinct()

        return queryset

class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if request.user.is_staff or request.user.is_superuser: 
            wishlist = Wishlist.objects.all()
        else:
            wishlist = Wishlist.objects.filter(user=request.user)
        
        serializer = WishlistSerializer(wishlist, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_to_wishlist(self, request, pk=None):
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=404)

        if Wishlist.objects.filter(user=request.user, product=product).exists():
            return Response({"detail": "Product is already in your wishlist."}, status=400)

        Wishlist.objects.create(user=request.user, product=product)
        return Response({"detail": "Product added to wishlist."}, status=201)

    @action(detail=True, methods=['delete'])
    def remove_from_wishlist(self, request, pk=None):
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=404)

        try:
            wishlist_item = Wishlist.objects.get(user=request.user, product=product)
            wishlist_item.delete()
            return Response({"detail": "Product removed from wishlist."}, status=200)
        except Wishlist.DoesNotExist:
            return Response({"detail": "Product not in your wishlist."}, status=404)

class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    
class ProductColorQuantityViewSet(viewsets.ModelViewSet): 
    permission_classes = [IsSellerOrReadOnly]
    serializer_class = ProductColorQuantitySerializer
    queryset = ProductColorQuantity.objects.all()
    
    def get_queryset(self):
        user = self.request.user
        queryset = ProductColorQuantity.objects.all()
        
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product__id=product_id)
        
        if user.role in ['admin', 'seller']:
            return queryset
        return ProductColorQuantity.objects.none()

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required."}, status=400)
        return super().create(request, *args, **kwargs)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self.check_object_permissions(request, instance):
            raise PermissionDenied("You do not have permission to edit this.")
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self.check_object_permissions(request, instance):
            raise PermissionDenied("You do not have permission to partially update this.")
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
