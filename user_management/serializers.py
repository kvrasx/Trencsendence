from .models import User, Match
from rest_framework import serializers
from django.contrib.auth.hashers import make_password # for the password hashing

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'display_name', 'email', 'avatar', 'online', 'created_at']
        read_only_fields = ['created_at'] # user_id is AutoField so it will be read_only by default, but I'll add them for readability convention
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'write_only': True},
        }

    def validate_password(self, value):
        if not value or len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        return make_password(value)

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            raise serializers.ValidationError({"username": "Username cannot be changed"})
        if not validated_data.get('password'):
            raise serializers.ValidationError({"password": "Invalid password"})
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['match_id', 'game_type', 'winner', 'loser', 'score', 'match_date']
        read_only_fields = ['match_id', 'match_date']

    def create(self, validated_data):
        if validated_data.get('winner') == validated_data.get('loser'):
            raise serializers.ValidationError("the winner and loser should not be the same.")
        instance = Match.objects.create(**validated_data)
        instance.save()
        return instance
