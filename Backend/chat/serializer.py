from rest_framework import serializers
from .models import Invitations,Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'chat_id', 'sender_id', 'msg', 'sent_at']

class InviteFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitations
        fields = ['user1', 'user2', 'type']

class GlobalFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitations
        fields = ['user2', 'type']

# class ChatsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Invitations
#         fields = ['friendship_id', 'user1', 'user2']



class ChatsSerializer(serializers.ModelSerializer):
    user2 = serializers.SerializerMethodField()
    chat_id = serializers.SerializerMethodField()  

    class Meta:
        model = Invitations
        fields = ['chat_id', 'user2']

    def get_user2(self, obj):
        user = self.context['request'].user
        other_user = obj.user2 if obj.user1 == user else obj.user1
        return other_user

    def get_chat_id(self, obj):
        return obj.friendship_id
