from djoser.serializers import UserCreateSerializer
from .models import CustomUser


class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = CustomUser
        fields = ("id", "username", "email", "password", "role")
