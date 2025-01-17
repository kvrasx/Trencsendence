from rest_framework import serializers
from .models import Tournament
from user_management.serializers import UserSerializer

class TournamentSerializer(serializers.ModelSerializer):
    position1 = UserSerializer(read_only=True)
    position2 = UserSerializer(read_only=True)
    position3 = UserSerializer(read_only=True)
    position4 = UserSerializer(read_only=True)
    position5 = UserSerializer(read_only=True)
    position6 = UserSerializer(read_only=True)
    position7 = UserSerializer(read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'