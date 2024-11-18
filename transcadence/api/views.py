from django.shortcuts import render
from rest_framework.response import Response as res
from rest_framework import status
from rest_framework.decorators import api_view as api
from django.http import HttpResponse
from rest_framework.views import APIView
from .serializer import ChatsSerializer, MessageSerializer
from .models import Message,Chats
from django.db.models import Q


@api(['POST'])
def addFriend(request,param1=None,param2=None):
    if (param1 == param2):
        return res(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    query_1 = Chats.objects.filter(Q(user1_ID=param1) & Q(user2_ID=param2))
    query_2 = Chats.objects.filter(Q(user1_ID=param2) & Q(user2_ID=param1))
    if (query_1.exists() or query_2.exists()):
        existing_chats = query_1 | query_2  # Combine both queries
        serializer = ChatsSerializer(existing_chats, many=True)
        return res(serializer.data, status=status.HTTP_200_OK)
    data = {
        'user1_ID': param1,
        'user2_ID': param2
    }
    serializer = ChatsSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return res(serializer.data, status=status.HTTP_201_CREATED)
    return res(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api(['GET'])
def getChats(request, param1=None):
    chats = Chats.objects.filter(Q(user1_ID=param1) | Q(user2_ID=param1))
    serializer = ChatsSerializer(chats, many=True)
    return res(serializer.data, status=status.HTTP_200_OK)

@api(['POST'])
def addMsg(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return res(serializer.data, status=status.HTTP_201_CREATED)
    return res(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api(['GET'])
def getMessages(request, param1=None):
    Messages = Message.objects.filter(chatId=param1)
    serializer = MessageSerializer(Messages, many=True)
    return res(serializer.data, status=status.HTTP_200_OK)
