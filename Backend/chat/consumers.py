from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
# from .views import async_to_sync
from .serializer import ChatsSerializer, MessageSerializer
from .models import Invitations
import json
from django.db.models import Q
from user_management.models import User

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        user: User = self.scope["user"]
        if user.is_anonymous:
        #     # self.accept()
        #     # self.close(code=4001, reason='Unauthorized')
            return
        print(user)
        self.accept()
        self.user_name = self.scope["url_route"]["kwargs"]["user"]
        self.room_group_name = self.scope["url_route"]["kwargs"]["room"]
        try:
            Invitations.objects.get(Q(friendship_id=int(self.room_group_name)) & (Q(user1=self.user_name) | Q(user2=self.user_name)))
        except:
            return
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

    def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name
            )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json["message"]
            serializer = MessageSerializer(data=message)
            if serializer.is_valid():
                serializer.save()
            else:
                print(message)
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat.message", 
                    "message": message,
                    "sender_channel_name": self.channel_name
                }
            )
        except:
            return

    def chat_message(self, event):
        message = event["message"]
        # if self.channel_name != event["sender_channel_name"]:
        self.send(text_data=json.dumps({"message": message}))