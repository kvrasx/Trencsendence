from rest_framework import serializers
from .models import Tournament
from user_management.serializers import UserSerializer

class TournamentSerializer(serializers.ModelSerializer):
    position1_user = UserSerializer(source='position1', read_only=True)
    position2_user = UserSerializer(source='position2', read_only=True)
    position3_user = UserSerializer(source='position3', read_only=True)
    position4_user = UserSerializer(source='position4', read_only=True)
    position5_user = UserSerializer(source='position5', read_only=True)
    position6_user = UserSerializer(source='position6', read_only=True)
    position7_user = UserSerializer(source='position7', read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'