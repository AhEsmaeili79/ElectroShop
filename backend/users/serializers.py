# users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


# Serializer for user signup
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Password should not be readable

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        # Create a user instance with the provided data
        user = User(**validated_data)
        user.set_password(validated_data["password"])  # Hash the password before saving
        user.save()
        return user


# Serializer for user details
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)  # Email is read-only
    username = serializers.CharField(read_only=True)  # Username is read-only
    role = serializers.CharField(read_only=True)  # Role is read-only

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "role",
            "first_name",
            "last_name",
            "profile_image",
            "phonenumber",
            "date_birth",
            "address",
            "city",
            "street",
            "floor",
            "apartment",
            "zip_code",
            "additional_information",
        ]
