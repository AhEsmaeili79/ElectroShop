from rest_framework import viewsets, permissions
from .models import Product, Wishlist,Color
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import ProductSerializer, WishlistSerializer,ColorSerializer
from .Pagination.pagination import ProductPagination
from .Permissions.permissions import IsSellerOrReadOnly

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == "seller":
            return Product.objects.filter(seller=user)
        return Product.objects.none()

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class CustomerProductViewSet(viewsets.ReadOnlyModelViewSet): 
    serializer_class = ProductSerializer
    permission_classes = [] 
    
    def get_queryset(self):
        """
        This method customizes the queryset based on the category, color, and brand filters in the request.
        """
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

        color_ids = self.request.query_params.get('color', '')
        if color_ids:
            if ',' in color_ids:
                color_ids_list = color_ids.split(',')
            else:
                color_ids_list = self.request.query_params.getlist('color')
            color_ids_list = [int(id.replace('color-', '')) for id in color_ids_list]
            queryset = queryset.filter(colors__id__in=color_ids_list)

        return queryset

class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        Get all products in the user's wishlist
        """
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