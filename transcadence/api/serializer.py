from rest_framework import serializers
from .models import Message, Chats

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['chatId', 'senderId', 'msg', 'sent_at']

class ChatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chats
        fields = ['chatId','user1_ID', 'user2_ID']