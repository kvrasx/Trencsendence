from django.shortcuts import render
from rest_framework.response import Response 
from rest_framework import status
from rest_framework.decorators import api_view 
from django.http import HttpResponse
from rest_framework.views import APIView
from .serializer import ChatsSerializer, MessageSerializer,InvitationSerializer
from .models import Message,Invitations, Invitations
from django.db.models import Q


@api_view(['POST'])
def addFriend(request):
    serializer = InvitationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def getChats(request,user_id=None):
    chats = Invitations.objects.filter((Q(user1=user_id) | Q(user2=user_id)) & Q(status="accepted") & Q(type="friend"))
    serializer = ChatsSerializer(chats, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
 


@api_view(['GET'])
def getMessages(request, chat=None):
    Messages = Message.objects.filter(chatId=chat)
    serializer = MessageSerializer(Messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def index(request):
    return render(request, 'index.html')
