from rest_framework.response import Response 
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.http import HttpResponse
from rest_framework.views import APIView
from .serializer import ChatsSerializer, MessageSerializer,GlobalFriendSerializer,InviteFriendSerializer, NotifCount, NotificationSerializer
from .models import Message,Invitations,NotifCountmodel
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from user_management.models import User
from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from ping_pong.views import userAcceptedTournament
import asyncio
from ping_pong.models import Tournament

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inviteFriend(request):

    serializer = GlobalFriendSerializer(data=request.data)
    jwt_user = request.user.id
    if (serializer.is_valid()):
        user1 = serializer.validated_data.get('user1')
        _type = serializer.validated_data.get('type')
        if jwt_user == user1:
            return Response("Detail: Cant Invite it self", status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        query = User.objects.get(Q(id=user1))
    except:
        return Response("Detail: cant invite the player doesnt exist", status=status.HTTP_400_BAD_REQUEST)

    if _type != "friend":
        try:
            o = Invitations.objects.get(Q(user1=user1,user2=jwt_user,type="friend", status="accepted") | Q(user1=jwt_user,user2=user1,type="friend", status="accepted"))
        except:
            return Response("Detail: Not a friend", status=status.HTTP_400_BAD_REQUEST)
    
    if _type == "tournament":
        o = Tournament.objects.filter(Q(tournamentID=jwt_user) & Q(status="ongoing"))
        if not o.exists() :
            return Response("Detail: Dont have an ongoing Tournament", status=status.HTTP_400_BAD_REQUEST)
    # try:
    #     o = Invitations.objects.get(Q(user1=user1,user2=jwt_user,type="friend") | Q(user1=jwt_user,user2=user1,type="friend"))
    # except:
    #     return Response("Detail: Not a friend", status=status.HTTP_400_BAD_REQUEST)
    
    try:
        o = Invitations.objects.get(Q(user1=user1,user2=jwt_user,type=_type) | Q(user1=jwt_user,user2=user1,type=_type))
    except Exception as e:
        mydata = {
            "user1": jwt_user,
            "user2": user1,
            "type": _type
        }
        newRecord= InviteFriendSerializer(data=mydata)
        if (newRecord.is_valid()):
            newRecord.save()
            channel_layer = get_channel_layer()
            group_name = f"user_{user1}"
            count = 1
            try :
                query = NotifCountmodel.objects.get(Q(user_id=user1))
                query.count = query.count + 1
                query.save()
                count = query.count
            except Exception as e:
                print(e)
                mydata = {
                "count": count,
                "user_id": user1
                }
                serializer = NotifCount(data=mydata)
                if serializer.is_valid():
                    serializer.save()   
                else:
                    print("Serializer errors:", serializer.errors)
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "update.count",
                    "message": count
                }
            )
            return Response("Invited player successfuly", status=status.HTTP_201_CREATED)
    return Response("invitation already exist", status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acceptFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        recv = user.id
        sender = validated_data.get('user1')
        type = validated_data.get('type')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if (sender == recv):
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)
    try:
        query = Invitations.objects.get(user2=recv,user1=sender,status="pending",type=type)
    except:
        return Response("Detail: Invitation not found", status=status.HTTP_404_NOT_FOUND)
    query.status="accepted"
    if query.type == "game":
        query.type = "join"
    query.save()
    if (query.type == "game"):
            return Response(query.friendship_id, status=status.HTTP_200_OK)
    
    if query.type == "tournament":
        print("entered here channel")
        # Get the channel layer
        channel_layer = get_channel_layer()
        
        # Send to a background worker
        async_to_sync(channel_layer.send)(
            "tournament-background",
            {
                "type": "tournament_accept",
                "tournament_id": sender,
                "user_id": user.id
            }
        )

    return Response("detail: Invitation accepted successfuly", status=status.HTTP_200_OK)        
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def declineFriend(request):
    serializer = GlobalFriendSerializer(data=request.data)
    if (serializer.is_valid()):
        validated_data = serializer.validated_data
        user: User = request.user
        user1 = validated_data.get('user1')
        type = validated_data.get('type')
        user2 = user.id
        print(str(user1) + "   " + str(user2))
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if (user1 == user2):
        return Response("Detail: Cant Decline ", status=status.HTTP_400_BAD_REQUEST)

    try:
        query = Invitations.objects.get(user1=user1,user2=user2,status="pending", type=type)
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
        user1 = request.user.id
        user2 = validated_data.get('user1')
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if (user1 == user2):
        return Response("Detail: Cant block", status=status.HTTP_400_BAD_REQUEST)
    try:
        o = Invitations.objects.filter((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & (Q(type='tournament') | Q(type='game') | Q(type='join')))
        if o.exists():
            raise Exception("error")
        query = Invitations.objects.get((Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)) & Q(status='accepted') & Q(type='friend'))
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
        user2 = validated_data.get('user1')
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
    notifs = Invitations.objects.filter((Q(user2=user_id) & Q(status="pending")) | ((Q(user2=user_id) | Q(user1=user_id)) & Q(type="join")))
    serializer = NotificationSerializer(notifs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def isValidMatch(request, matchId=None, tournamentId=None):
    user_id = request.user.id
    try:
        notif = Invitations.objects.get(Q(friendship_id=matchId) & (Q(user1=user_id) | Q(user2=user_id)) & Q(type="join"))
        if notif.status == "pending":
            if tournamentId is None:
                return Response({"error": "Tournament ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            tournament = get_object_or_404(Tournament, id=tournamentId)
            print("notif:", tournament)
        return Response(GlobalFriendSerializer(notif).data, status=status.HTTP_200_OK)
    except:
        return Response({"error": "Invitation not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invitationStatus(request, type=None, target=None):
    try:
        if type == "tournament":
            try:
                tournament = Tournament.objects.get(tournamentID=request.user.id, status="ongoing")
                print(tournament)
            except:
                print("User doesn't have a tournament.")
                return Response({"detail": "tournament"}, status=404)
        invite = Invitations.objects.get((Q(user1=request.user.id, user2=target) | Q(user1=target, user2=request.user.id)) & Q(type=type))

        serializer = GlobalFriendSerializer(invite)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        if type == "game":
            try:
                invite = Invitations.objects.get((Q(user1=request.user.id, user2=target) | Q(user1=target, user2=request.user.id)) & Q(type="join"))  
                return Response(GlobalFriendSerializer(invite).data, status=status.HTTP_200_OK)
            except:
                return Response({"detail": "join"}, status=404)
        print(e)
        return Response("Detail: Invitation not found", status=status.HTTP_404_NOT_FOUND)