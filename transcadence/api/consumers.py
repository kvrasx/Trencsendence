from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
# from .views import async_to_sync
from .serializer import ChatsSerializer, MessageSerializer
import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user_name = self.scope["url_route"]["kwargs"]["user"]
        self.room_group_name = self.scope["url_route"]["kwargs"]["room"]
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        serializer = MessageSerializer(data=message)
        if serializer.is_valid():
            serializer.save()
        # else:
        #     print(serializer.errors)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat.message", 
                "message": message,
                "sender_channel_name": self.channel_name
            }
        )

    def chat_message(self, event):
        message = event["message"]
        # if self.channel_name != event["sender_channel_name"]:
        self.send(text_data=json.dumps({"message": message}))