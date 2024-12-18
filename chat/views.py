from django.shortcuts import render
from rest_framework.response import Response 
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.http import HttpResponse
from rest_framework.views import APIView
from .serializer import ChatsSerializer, MessageSerializer,InvitationSerializer
from .models import Message,Invitations
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated


@api_view(['POST'])
def inviteFriend(request):
    serializer = InvitationSerializer(data=request.data)
    if serializer.is_valid():
        user1 = serializer.validated_data.get("user1")
        user2 = serializer.validated_data.get("user2")
        try: 
            o = Invitations.objects.get(Q(user1=user1,user2=user2) | Q(user1=user2,user2=user1))
            return Response("cant invite the player", status=status.HTTP_400_BAD_REQUEST)
        except:
            serializer.save()
            return Response("Invited player successfuly", status=status.HTTP_201_CREATED)
    return Response("cant invite the player", status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acceptFriend(request):
    serializer = InvitationSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user_id1 = validated_data.get('user1')
        user_id2 = validated_data.get('user2')
        type = validated_data.get('type')
        try:
            query = Invitations.objects.get(user2=user_id1,user1=user_id2,status="pending")
        except:
            return Response("Invitation not found", status=status.HTTP_400_BAD_REQUEST)
        query.status="accepted"
        query.save()
        return Response("detail: Invitation accepted successfuly", status=status.HTTP_200_OK)        
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def declineFriend(request):
    serializer= InvitationSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user1 = validated_data.get('user1')
        user2 = validated_data.get('user2')
        try:
            query = Invitations.objects.get(user2=user1,user1=user2,status="pending")
            query.delete()
        except:
            return Response("Detail: Invitation Not found", status=status.HTTP_400_BAD_REQUEST)
    return Response("Detail: Declined successfully",status=status.HTTP_200_OK)

@api_view(['POST'])
def blockFriend(request, user1=None, user2=None):
    try:
        query = Invitations.objects.get((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & Q(status='accepted'))
        query.status="blocked"
        query.save()
    except:
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)
    return Response("Detail: Blocked successfully", status=status.HTTP_200_OK)

@api_view(['POST'])
def deblockFriend(request, user1=None, user2=None):
    try:
        query = Invitations.objects.get((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & Q(status='blocked'))
        query.status="accepted"
        query.save()
    except:
        return Response("Detail: Cant Deblock", status=status.HTTP_400_BAD_REQUEST)
    return Response("Detail: Deblocked successfully", status=status.HTTP_200_OK)

@api_view(['GET'])
def getChats(request,user_id=None):
    chats = Invitations.objects.filter((Q(user1=user_id) | Q(user2=user_id)) & Q(status="accepted") & Q(type="friend"))
    serializer = ChatsSerializer(chats, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
 


@api_view(['GET'])
def getMessages(request, chat=None):
    Messages = Message.objects.filter(chat_id=chat)
    serializer = MessageSerializer(Messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def getNotifications(request, user_id=None):
    notifs = Invitations.objects.filter(Q(user2=user_id) & Q(status="pending"))
    serializer = InvitationSerializer(notifs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK) 


def index(request):
    return render(request, 'index.html')
