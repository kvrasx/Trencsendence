from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
# from .views import async_to_sync
from .serializer import ChatsSerializer, MessageSerializer, NotifCount
from .models import Invitations, NotifCountmodel
import json
from django.db.models import Q
from user_management.models import User

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        user: User = self.scope["user"]
        if user.is_anonymous:
            self.accept()
            self.close(code=4001, reason='Unauthorized')
            return
        self.accept()
        self.user_name = user.id
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
            full_data = {
                "msg": message,
                "chat_id": self.room_group_name,
                "sender_id": self.user_name,
            }
            serializer = MessageSerializer(data=full_data)
            print(message)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
            else:
                return
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "message": serializer.data,
                    "sender_channel_name": self.channel_name
                }
            )
        except Exception as e:
            print(f"debug: {e}")
            return

    def chat_message(self, event):
        message = event["message"]
        # if self.channel_name != event["sender_channel_name"]:
        self.send(text_data=json.dumps({"message": message}))




class count(WebsocketConsumer):
    def connect(self):
        user: User = self.scope["user"]
        if user.is_anonymous:
            self.accept()
            self.close(code=4001, reason='Unauthorized')
            return
        else:
            self.accept()
            self.user_id = user.id
            self.group_name = f"user_{self.user_id}"
            print("hada dyl lconsumer --> " + str(self.group_name))
            # self.group_name = "testgrp"
            async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name)
            try :
                query = NotifCountmodel.objects.get(Q(user_id=self.user_id))
                self.send(text_data=json.dumps({"count": query.count}))
            except:
                self.send(text_data=json.dumps({"count": 0}))

    def update_count(self, event):
        count = event["message"]
        print(f"count ---->" + str(count))
        self.send(text_data=json.dumps({"count": count}))
        return

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        isReaded = text_data_json["readed"]
        try:
            query = NotifCountmodel.objects.get(Q(user_id=self.user_id))
        except Exception as e:
            print(e)
            return
        if isReaded == True:
            print("dddddddddd")
            query.count = 0
            query.save()
            self.send(text_data=json.dumps({"count": 0}))
            # async_to_sync(self.channel_layer.group_send)(
            #     self.group_name,
            #     {
            #         "type": "update.count",
            #         "message": 0
            #     }
            # )

        return

    def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            print("disconnected: ", self.group_name)
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name,
                self.channel_name
            )