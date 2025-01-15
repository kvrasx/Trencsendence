from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import TournamentSerializer
from .models import Tournament
from chat.serializer import MessageSerializer
from chat.models import Invitations
from django.db.models import Q
from rest_framework.response import Response 


# Create your views here.

class CreateTournament(APIView):

    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.data['position1'] = request.user.id
        request.data['tournamentID'] = request.user.id
        serializer = TournamentSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": "Created tournament successfully."}, status=201)

def userAcceptedTournament(tournamentId, user):
    try:
        tournament = Tournament.objects.get(tournamentID=tournamentId)
    except Exception as e:
        print(e)
        return False

    if tournament.readytoplay():
        return
    
    tournament.available_players += 1
    if tournament.position2 is None:
        tournament.position2 = user
    elif tournament.position3 is None:
        tournament.position3 = user
    elif tournament.position4 is None:
        tournament.position4 = user
    tournament.save()

    print(tournament.readytoplay, tournament.available_players)

    if tournament.readytoplay():
        startTournament(tournament)

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
    else:
        return

def startTournament(tournament):
    print(f"Starting tournament {tournament.tournament_name}")

    participants = [tournament.position1, tournament.position2, tournament.position3, tournament.position4]
    for i in range(1, 4):
        sendTournamentWarning(participants[0].id, participants[i].id, "Tournament is starting")
    




