from rest_framework import serializers
from .models import Invitations,Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['chat_id', 'sender_id', 'msg', 'sent_at']

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitations
        fields = ['user1', 'user2', 'type']

class ChatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitations
        fields = ['friendship_id', 'user1', 'user2']

