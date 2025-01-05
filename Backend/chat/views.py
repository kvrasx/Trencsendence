from django.shortcuts import render
from rest_framework.response import Response 
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.http import HttpResponse
from rest_framework.views import APIView
from .serializer import ChatsSerializer, MessageSerializer,GlobalFriendSerializer,InviteFriendSerializer
from .models import Message,Invitations
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from user_management.models import User
import json


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inviteFriend(request):
    serializer = InviteFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        jwt_user = user.id
        user1 = validated_data.get('user1')
        user2 = validated_data.get('user2')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if user1 != jwt_user:
            return Response("Detail: Not authorized ", status=status.HTTP_401_UNAUTHORIZED)
    if user1 == user2:
        return Response("Detail: Cant Invite", status=status.HTTP_400_BAD_REQUEST)
    try: 
        o = Invitations.objects.get(Q(user1=user1,user2=user2) | Q(user1=user2,user2=user1))
        #q = User2 <---- mn 3end sma3il
        # return Response("cant invite the player", status=status.HTTP_400_BAD_REQUEST)
    except:
        serializer.save()
        return Response("Invited player successfuly", status=status.HTTP_201_CREATED)
    return Response("cant invite the player", status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acceptFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        user1 = user.id
        user2 = validated_data.get('user1')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if (user1 == user2):
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)
    try:
        query = Invitations.objects.get(user2=user1,user1=user2,status="pending")
    except:
        return Response("Detail: Invitation not found", status=status.HTTP_404_NOT_FOUND)
    query.status="accepted"
    query.save()
    return Response("detail: Invitation accepted successfuly", status=status.HTTP_200_OK)        
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def declineFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        user1 = user.id
        user2 = validated_data.get('user1')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if (user1 == user2):
        return Response("Detail: Cant Decline ", status=status.HTTP_400_BAD_REQUEST)

    try:
        query = Invitations.objects.get(user2=user1,user1=user2,status="pending")
        query.delete()
    except:
        return Response("Detail: Invitation Not found", status=status.HTTP_400_BAD_REQUEST)

    return Response("Detail: Declined successfully",status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def blockFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        user1 = user.id
        user2 = validated_data.get('user2')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if (user1 == user2):
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)

    try:
        query = Invitations.objects.get((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & Q(status='accepted'))
        query.status="blocked"
        query.save()
    except:
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)
    return Response("Detail: Blocked successfully", status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deblockFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        user1 = user.id
        user2 = validated_data.get('user2')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if (user1 == user2):
        return Response("Detail: Cant Deblock", status=status.HTTP_400_BAD_REQUEST)
    try:
        query = Invitations.objects.get((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & Q(status='blocked'))
        query.status="accepted"
        query.save()
    except:
        return Response("Detail: Cant Deblock", status=status.HTTP_400_BAD_REQUEST)
    return Response("Detail: Deblocked successfully", status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getChats(request):
    user: User = request.user
    user_id = user.id
    chats: Invitations = Invitations.objects.filter((Q(user1=user_id) | Q(user2=user_id)) & Q(status="accepted") & Q(type="friend"))
    serializer = ChatsSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMessages(request, chat=None):
    user: User = request.user
    user_id = user.id
    valid = Invitations.objects.filter(Q(friendship_id=chat) & (Q(user1=user_id) | Q(user2=user_id)))
    if not valid.exists():
        return Response({"error": "Not authorized to see this chat content"}, status=status.HTTP_401_UNAUTHORIZED)
    Messages: Message = Message.objects.filter(chat_id=chat)
    serializer = MessageSerializer(Messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getNotifications(request):
    user: User = request.user
    user_id = user.id
    notifs = Invitations.objects.filter(Q(user2=user_id) & Q(status="pending"))
    serializer = GlobalFriendSerializer(notifs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK) 

# method    endpoint/route      protocol/version
# POST      /getNotifications/ HTTP/1.1
# Host: localhost
# Content-Type: application/json

# {'userid1': 1, 'userid2': 2, 'userid3': 3, 'tournamentCreator': 4}


class CreateTournament(APIView):
    def post(self, request):
        try:
            # tournamentOwnerid = request.user.id
            data = json.loads(request.body.decode("utf-8"))
            userid1 = data.get('userid1')
            userid2 = data.get('userid2')
            userid3 = data.get('userid3')
            if (not userid1 or not userid2 or not userid3):
                return Response({'message': 'some userids are missing'}) #response as json
            return Response({'message': 'Success'})
        except json.JSONDecodeError:
            return Response({'message': 'Error exp'})
        # logic here
        

def index(request):
    return Response({'Test': 'Test'})