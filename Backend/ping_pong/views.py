from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import TournamentSerializer
from .models import Tournament
from chat.serializer import MessageSerializer
from chat.models import Invitations
from django.db.models import Q
from rest_framework.response import Response 
import os
from channels.db import database_sync_to_async
import asyncio
from django.utils import timezone
from .consumers import GameClient
from user_management.models import User
from asgiref.sync import async_to_sync, sync_to_async

# Create your views here.

class CreateTournament(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.data['position1'] = request.user.id
        request.data['tournamentID'] = request.user.id
        request.data['status'] = "ongoing"
        serializer = TournamentSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": "Created tournament successfully.", "tournament": serializer.data}, status=201)
    
class getTournament(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            tournament = Tournament.objects.get(tournamentID=request.user.id, status="ongoing")
            return Response({"tournament": TournamentSerializer(tournament).data}, status=200)
        except Exception as e:
            print("getTournament", e)
            return Response({"error": "You don't have any ongoing tournament."}, status=404)
        
class cancelTournament(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            tournament = Tournament.objects.get(tournamentID=request.user.id, status="ongoing")
            Invitations.objects.filter(user1=request.user.id, type="tournament").delete()
            tournament.status = "finished"
            tournament.save()
            return Response({"success": "Deleted tournament successfully."}, status=200)
        except Exception as e:
            print(e)
            return Response({"error": "You don't have any ongoing tournament."}, status=404)


def addUserToTournament(tournament_id, user):
    try:
        tournament = Tournament.objects.get(tournamentID=tournament_id, status="ongoing")
    except Exception as e:
        print(e)
        return None

    if tournament.available_players >= 4:
        return None

    # Update the tournament positions
    tournament.available_players += 1
    if not tournament.position2:
        tournament.position2 = user
    elif not tournament.position3:
        tournament.position3 = user
    elif not tournament.position4:
        tournament.position4 = user

    tournament.save()
    return tournament





async def userAcceptedTournament(tournamentId, user):

    tournament = await database_sync_to_async(addUserToTournament)(tournamentId, user)
    if tournament is None:
        return
    if await database_sync_to_async(tournament.readytoplay)() == True:
        t = await database_sync_to_async(tournamentControl)(tournament)
        asyncio.create_task(t.monitorTournament())



class tournamentControl:
    def __init__(self, tournament):
        self.matchInvites = []
        self.round = 1
        self.tournament: Tournament = tournament
        print(f"Starting tournament {tournament.tournament_name}")
        participants = [tournament.position1, tournament.position2, tournament.position3, tournament.position4]
        try:
            self.matchInvites.append(Invitations.objects.create(user1=participants[0].id, user2=participants[1].id, type="join", status="accepted"))
            self.matchInvites.append(Invitations.objects.create(user1=participants[2].id, user2=participants[3].id, type="join", status="accepted"))
        except Exception as e:
            print("tournament control: ", e)
            return

        self.finished = False
        
        for i in range(1, 4):
            sendTournamentWarning(participants[0].id, participants[i].id, "Tournament is starting")
        
        sendTournamentWarning(participants[0].id, participants[1].id, f"First round: <a href='http://{os.environ.get('VITE_HOST')}/ping-pong/{self.matchInvites[0].friendship_id}/{self.tournament.id}' > Click here to play </a>")
        sendTournamentWarning(participants[0].id, participants[2].id, f"First round: <a href='http://{os.environ.get('VITE_HOST')}/ping-pong/{self.matchInvites[1].friendship_id}/{self.tournament.id}' > Click here to play </a>")
        sendTournamentWarning(participants[0].id, participants[3].id, f"First round: <a href='http://{os.environ.get('VITE_HOST')}/ping-pong/{self.matchInvites[1].friendship_id}/{self.tournament.id}' > Click here to play </a>")


    def someChecks(self, invite: Invitations):
        print("Checking invite: ", invite.created_at, "---" , timezone.now())
        if invite.friendship_id:
            if timezone.now() - invite.created_at > timezone.timedelta(minutes=1):
                print("removing automatically")
                winner = GameClient.invite_matches[f"xo_{invite.friendship_id}"][0] if f"xo_{invite.friendship_id}" in GameClient.invite_matches else invite.user1
                winner = User.objects.get(id=winner)
                invite.delete()
                if self.round == 1 and self.tournament.position5 == None:
                    self.tournament.position5 = winner
                elif self.round == 1 and self.tournament.position6 == None:
                    self.tournament.position6 = winner
                elif self.round == 2 and self.tournament.position7 == None:
                    self.tournament.position7 = winner
                self.tournament.current_round += 1
                self.tournament.save()
        if self.tournament.status == "finished" or self.tournament.current_round == 3:
            self.finished = True


    async def monitorTournament(self):
        print("enter monitor")
        while self.finished == False:
            for inv in self.matchInvites:
                await database_sync_to_async(self.someChecks)(inv)
            await asyncio.sleep(5)

        print("Tournament finished")
        self.tournament.status = "finished"
        await database_sync_to_async(self.tournament.save)()
        




def sendTournamentWarning(sender, target, message):
    try:
        chat_id = Invitations.objects.filter((Q(user1=sender, user2=target)) | Q(user2=sender, user1=target)).first().friendship_id
    except Exception as e:
        print(e)
        return
    print(f"Sending warning to {target}")
    full_data = {
        "msg": message,
        "chat_id": chat_id,
        "sender_id": sender,
    }
    serializer = MessageSerializer(data=full_data)
    if serializer.is_valid():
        serializer.save()
