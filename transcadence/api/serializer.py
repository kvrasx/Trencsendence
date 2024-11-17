from rest_framework import serializers
from .models import msg
class myFirstSerializer(serializers.ModelSerializer):
    class Meta:
        model = msg
        fields = ['content', 'timestamp']