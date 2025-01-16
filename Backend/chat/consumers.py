from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
# from .views import async_to_sync
from .serializer import ChatsSerializer, MessageSerializer, NotifCount
from .models import Invitations, NotifCountmodel
import json
from django.db.models import Q
from user_management.models import User
from .views import userAcceptedTournament
from channels.consumer import AsyncConsumer, SyncConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        user: User = self.scope["user"]
        if user.is_anonymous:
            self.accept()
            self.close(code=4008, reason='Unauthorized')
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
            # print(message)
            if serializer.is_valid():
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
            # print(f"debug: {e}")
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
            self.close(code=4008, reason='Unauthorized')
            return
        else:
            self.accept()
            self.user_id = user.id
            self.group_name = f"user_{self.user_id}"
            # print("hada dyl lconsumer --> " + str(self.group_name))
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
        # print(f"count ---->" + str(count))
        self.send(text_data=json.dumps({"count": count}))
        return

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        isReaded = text_data_json["readed"]
        try:
            query = NotifCountmodel.objects.get(Q(user_id=self.user_id))
        except Exception as e:
            # print(e)
            return
        if isReaded == True:
            query.count = 0
            query.save()
            self.send(text_data=json.dumps({"count": 0}))

    def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            # print("disconnected: ", self.group_name)
            async_to_sync(self.channel_layer.group_discard)(
                self.group_name,
                self.channel_name
            )


class onlineStatus(WebsocketConsumer):
    online_users = {}

    def connect(self):
        self.user: User = self.scope["user"]
        if self.user.is_anonymous:
            self.accept()
            self.close(code=4008, reason='Unauthorized')
            return
        
        if self.user.id not in self.online_users:
            self.online_users[self.user.id] = [ self.channel_name ]
            self.user.online = True
            self.user.save()
        else:
            self.online_users[self.user.id].append(self.channel_name)

        self.accept()


    def disconnect(self, close_code):
        if (close_code == 4008):
            return
        self.online_users[self.user.id].remove(self.channel_name)
        # print(self.online_users[self.user.id])
        if len(self.online_users[self.user.id]) == 0:
            del self.online_users[self.user.id]
            self.user.online = False
            self.user.save()

    

# consumer.py
class TournamentBackgroundConsumer(AsyncConsumer):
    # Remove the __init__ method - it's not needed
    async def tournament_accept(self, message):
        tournament_id = message["tournament_id"]
        user = await self.get_user(message["user_id"])        
        if user:
            await userAcceptedTournament(tournament_id, user)
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None