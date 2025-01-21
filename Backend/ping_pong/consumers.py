from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
# import asyncio
import threading
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from chat.models import Invitations
from user_management.viewset_match import MatchTableViewSet
from .players_manager import player_manager
import math
from .models import Tournament
from user_management.serializers import UserSerializer

def advanceTournament(tournamentId, matchEntry):
    try:
        tournament = Tournament.objects.get(id=tournamentId, status="ongoing")
    except Exception as e:
        print("advance tournament: ", e)
        return None
    
    if tournament.available_players == 4 and tournament.status == "ongoing":
        if tournament.current_round == 1:
            if tournament.match1 is None:
                tournament.match1 = matchEntry
            elif tournament.match2 is None:
                tournament.match2 = matchEntry
            
            if tournament.position5 is None:
                tournament.position5 = matchEntry.winner
            elif tournament.position6 is None:
                tournament.position6 = matchEntry.winner
                tournament.current_round += 1
            
        elif tournament.current_round == 2:
            if tournament.match3 is None:
                tournament.match3 = matchEntry
            
            if tournament.position7 is None:
                tournament.position7 = matchEntry.winner
                tournament.current_round += 1
                tournament.status = "finished"

        tournament.save()

class Match:
    def __init__(self, player_1, player_2, group_name):
        self.player1 = player_1
        self.player2 = player_2
        self.group_name = group_name
        self.ball = Ball()
        self.paddleRight = Paddle("right")
        self.paddleLeft = Paddle("left")
        self.is_active = True

class Ball:
    def __init__(self):
        self.canvas_height = 800
        self.canvas_width = 1300
        self.x = 1300 // 2
        self.y = 800 // 2
        self.radius = 20
        self.speedX = 3
        self.speedY = 0
        self.angle = 0
        self.constSpeed = 14
        self.scoreRight = 0
        self.scoreLeft = 0
    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
            'radius' :self.radius,
            'speedX': self.speedX,
            'speedY': self.speedY,
            'angle': self.angle,
            'canvas_width': self.canvas_width,
            'canvas_height': self.canvas_height,
            'constSpeed': self.constSpeed,
            'scoreRight': self.scoreRight,
            'scoreLeft': self.scoreLeft
        }
        
class Paddle:
    def __init__(self, paddle):
        self.canvasHeight = 800
        self.canvasWidth = 1300
        self.paddleWidth = 17
        self.paddleHeight = 180
        self.paddleY = 100
        self.paddleSpeed = 10
        self.paddleBord = 10
        self.paddleScore = 0
        # self.user_id = None
        if paddle == "right":
            self.paddleX = 1300 * 0.98
        else:
            self.paddleX = 1300 * 0.006

    def to_dict(self):
        return {
            'width': self.paddleWidth,
            'height': self.paddleHeight,
            'x': self.paddleX,
            'y': self.paddleY,
            'speed': self.paddleSpeed,
            'border': self.paddleBord,
            'score': self.paddleScore,
            'canvasHeight': self.canvasHeight,
            'canvasWidth': self.canvasWidth 
        }

class GameClient(AsyncWebsocketConsumer):
    

    connected_sockets = []
    invite_matches = {}
    
    
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        print("user:", self.user)

        is_added = await player_manager.add_player(self.user.id)
        if not is_added:
            await self.accept()
            await self.close(code=4009)
            return
    
        self.player = {
            "p": {
                'player_name': self.channel_name,
                'player_number': '',
                'player_username': self.user.username,
                'user_id': self.user.id,
                'user': UserSerializer(self.user).data
            },
            "match": None
        }
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        if self.room_name == 'random':
            await self.random_mode()
        else:
            try:
                await self.invite_mode()
            except Exception as e:
                print(e)
                await player_manager.remove_player(self.user.id)
                await self.accept()
                await self.close(code=4007)
                return   
                
        await self.accept()


    async def disconnect(self, close_code):
        if close_code == 4009 or close_code == 4008:
            return
        
        await player_manager.remove_player(self.user.id)

        if hasattr(self, 'group_name'):
            self.safe_operation("self.connected_sockets.remove(self.player)")
            if hasattr(self, "new_match"):
                self.new_match.is_active = False
                if self.new_match.ball.scoreLeft < 5 and self.new_match.ball.scoreRight < 5:
                    await self.channel_layer.group_send(
                        self.new_match.group_name,
                        {
                            "type": "freee_match",
                            "winner": self.new_match.player2 if self.new_match.player1["player_username"] == self.user.username else self.new_match.player1
                        }
                    )
            await self.channel_layer.group_discard(self.group_name, self.player["p"]["player_name"])
            self.safe_operation("del self.invite_matches[self.group_name]")



    async def random_mode(self):
        self.group_name = f'group_{self.user.username}'
        if len (self.connected_sockets) % 2 == 0:
            self.player["p"]['player_number'] = '2'
        else:
            self.player["p"]['player_number'] = '1'
        self.connected_sockets.append(self.player)
        if len(self.connected_sockets) == 2: # Running only by second player
            player2 = self.connected_sockets.pop()
            # player2['p']['player_number'] = '2'
            player1 = self.connected_sockets.pop()
            # player1['p']['player_number'] = '1'
            self.group_name = f'group_{player1["p"]["player_username"]}'
            self.new_match = Match(player1['p'], player2['p'], self.group_name)
            player1["match"] = self.new_match
            player2["match"] = self.new_match
            await self.channel_layer.group_add(self.new_match.group_name, player1['p']['player_name'])
            await self.channel_layer.group_add(self.new_match.group_name, player2['p']['player_name'])
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "start_match",
                }
            )
            self.new_match.is_active = True
            asyncio.create_task(self.start_ball_movement())
    
    async def invite_mode(self):
        inviteId = int(self.scope['url_route']['kwargs']['room_name'])
        if self.scope['url_route']['kwargs'].get('tournament_id'):
            # check if the tournament id is valid and check if this match invitation is part of the tournament
            self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        invite = await database_sync_to_async(get_object_or_404)(Invitations, friendship_id=inviteId, type='join')
        if invite.user1 != self.user.id and invite.user2 != self.user.id:
            raise Exception("You are not invited to this match")
        
        if invite.status == "pending":
            await database_sync_to_async(self.check_tournamnet)()

        self.group_name = f"pong-pong_{inviteId}"
        
        if self.group_name in self.invite_matches:
            self.invite_matches[ self.group_name ].append( self.player )
        else:
            self.invite_matches[ self.group_name ] = [ self.player ]

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        invitedPlayers = self.invite_matches[ self.group_name ]
        if (len(invitedPlayers) == 1):
            self.player["p"]['player_number'] = '1'
        else:
            self.player["p"]['player_number'] = '2'
            self.new_match = Match(invitedPlayers[0]['p'], invitedPlayers[1]['p'], self.group_name)
            invitedPlayers[0]['match'] = self.new_match
            invitedPlayers[1]['match'] = self.new_match
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "start_match",
                }
            )
            await database_sync_to_async(invite.delete)()
            self.new_match.is_active = True
            asyncio.create_task(self.start_ball_movement()) # need to be cleaned 
     

    def check_tournamnet(self):
        if hasattr(self, 'tournament_id') == False:
            raise Exception("This match is part from a tournament, please provide the tournament id")
        try:
            tournament = get_object_or_404(Tournament, id=self.tournament_id, status="ongoing")
        except Exception as e:
            print(e)
            raise Exception("Tournament not found or not ongoing")


    def safe_operation(self, operation):
        try:
            exec(operation)
        except:
            pass

    async def receive(self, text_data):
    
        try:
            data = json.loads(text_data)
        except Exception as e:
            print("error :", e)
        if data['type'] == 'paddleMove':
            if data['playerNumber'] == '1':
                self._move_paddle(self.new_match.paddleRight, data['direction'])
            elif data['playerNumber'] == '2':
                self._move_paddle(self.new_match.paddleLeft, data['direction'])
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'paddleMoved',
                    'playerNumber': data['playerNumber'],
                    'updateY': self.new_match.paddleRight.to_dict() if data['playerNumber'] == '1' else self.new_match.paddleLeft.to_dict()
                }
            )
        if data['type'] == 'cancel':
            await self.close()
                
                
    def _move_paddle(self, paddle, direction):
        if direction == 'up' and paddle.paddleY > 20:
            paddle.paddleY -= 10
        elif direction == 'down' and paddle.paddleY < (paddle.canvasHeight - paddle.paddleHeight) - 20:
            paddle.paddleY += 10
                
    

    async def start_ball_movement(self):
        while self.new_match.is_active:
            self.new_match.ball.x += self.new_match.ball.speedX
            self.new_match.ball.y += self.new_match.ball.speedY

            if self.new_match.ball.y - self.new_match.ball.radius <= 0 or self.new_match.ball.y + self.new_match.ball.radius >= self.new_match.ball.canvas_height:
                self.new_match.ball.speedY *= -1  # Reverse the vertical direction

            await self._check_paddle_collision(self.new_match.paddleLeft, "left")
            await self._check_paddle_collision(self.new_match.paddleRight, "Right")

            if self.new_match.ball.x - self.new_match.ball.radius <= 0:
                await self._reset_ball(self.new_match.paddleRight, "Right")  # Reset the ball to the center 
            if self.new_match.ball.x + self.new_match.ball.radius >= self.new_match.ball.canvas_width:
                await self._reset_ball(self.new_match.paddleLeft, "Left")

            if (self.new_match.ball.scoreRight == 5 or self.new_match.ball.scoreLeft == 5):
                self.new_match.is_active = False
                score = f"0{self.new_match.ball.scoreRight}:0{self.new_match.ball.scoreLeft}"
                matchEntry = await database_sync_to_async(MatchTableViewSet.createMatchEntry)({
                    "game_type": 1,
                    "winner": self.new_match.player1["user_id"] if  self.new_match.ball.scoreRight == 5 else self.new_match.player2["user_id"],
                    "loser": self.new_match.player2["user_id"] if  self.new_match.ball.scoreRight == 5 else self.new_match.player1["user_id"],
                    "score": score
                })
                if hasattr(self, 'tournament_id'):
                    await database_sync_to_async(advanceTournament)(self.tournament_id, matchEntry)
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type" : "game_finished",
                        "winner": self.new_match.player1 if self.new_match.ball.scoreRight == 5 else self.new_match.player2,
                        "score":  score
                    }
                )
                return 
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'ballUpdated',
                    'ball': self.new_match.ball.to_dict()
                }
            )
            await asyncio.sleep(1/60)

    
    async def ballUpdated(self, event):
        await self.send(json.dumps({
            'type': event['type'], 
            'ball': event['ball'] 
        }))

    async def _check_paddle_collision(self, paddle, lORr):

        if (lORr == "left"):
            if (self.new_match.ball.x - self.new_match.ball.radius <= paddle.paddleX + paddle.paddleWidth and self.new_match.ball.y - self.new_match.ball.radius >= paddle.paddleY and self.new_match.ball.y + self.new_match.ball.radius <= paddle.paddleY + paddle.paddleHeight) or (self.new_match.ball.x - self.new_match.ball.radius <= paddle.paddleX + paddle.paddleWidth and self.new_match.ball.y  >= paddle.paddleY and self.new_match.ball.y <= paddle.paddleY + paddle.paddleHeight):
                poinofCollision = self.new_match.ball.y - (paddle.paddleY + (paddle.paddleHeight / 2))
                poinofCollision /= (paddle.paddleHeight / 2)
                self.new_match.ball.angle = poinofCollision * (math.pi / 4)
                if (self.new_match.ball.x > (self.new_match.ball.canvas_width / 2)):
                    direction = -1
                else:
                    direction = 1
                self.new_match.ball.speedX = direction * self.new_match.ball.constSpeed * math.cos(self.new_match.ball.angle)
                self.new_match.ball.speedY = self.new_match.ball.constSpeed * math.sin(self.new_match.ball.angle)
                if (self.new_match.ball.constSpeed < 25):
                    self.new_match.ball.constSpeed += 0.005
                return True
            else:
                   return False
        if (lORr == "Right"):
            if (self.new_match.ball.x + self.new_match.ball.radius >= paddle.paddleX and self.new_match.ball.y - self.new_match.ball.radius >= paddle.paddleY and  self.new_match.ball.y + self.new_match.ball.radius <= paddle.paddleY + paddle.paddleHeight) or (self.new_match.ball.x + self.new_match.ball.radius >= paddle.paddleX and self.new_match.ball.y  >= paddle.paddleY and self.new_match.ball.y <= paddle.paddleY + paddle.paddleHeight): 
                poinofCollision = self.new_match.ball.y - (paddle.paddleY + (paddle.paddleHeight / 2))
                poinofCollision /= (paddle.paddleHeight / 2)
                self.new_match.ball.angle = poinofCollision * (math.pi / 4)
                if (self.new_match.ball.x > (self.new_match.ball.canvas_width / 2)):
                    direction = -1
                else:
                    direction = 1
                self.new_match.ball.speedX = direction * self.new_match.ball.constSpeed * math.cos(self.new_match.ball.angle)
                self.new_match.ball.speedY = self.new_match.ball.constSpeed * math.sin(self.new_match.ball.angle)
                if (self.new_match.ball.constSpeed < 25):
                    self.new_match.ball.constSpeed += 0.005
                return True
            else:
                return False
        
        
        
    async def _reset_ball(self, paddle, lorr):
        self.new_match.ball.x = self.new_match.ball.canvas_width // 2
        self.new_match.ball.y = self.new_match.ball.canvas_height // 2
        self.new_match.ball.speedX *= -1  # Reverse the horizontal direction
        self.new_match.ball.speedY = 0
        if lorr == "Left":
            self.new_match.ball.scoreRight += 1
        if lorr == "Right":
            self.new_match.ball.scoreLeft += 1


    async def paddleMoved(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'playerNumber': event['playerNumber'],
            'updateY': event['updateY']
        }))
    
    async def game_finished(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'winner': event['winner'],
            'score': event['score']
        }))
        await self.close(code=4007)
        
    async def freee_match(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'winner': event['winner']
        }))
        await self.close()

    async def start_match(self, event):

        self.new_match = self.player["match"]

        await self.send(json.dumps({
            'type': 'game_started',
            'information': self.player["p"],
            'started': 'yes',
            'paddleRight': self.new_match.paddleRight.to_dict(),
            'paddleLeft': self.new_match.paddleLeft.to_dict(),
            'ball': self.new_match.ball.to_dict(),
            'opponent': self.new_match.player1['user'] if self.new_match.player2['user_id'] == self.user.id else self.new_match.player2['user']
        }))

    async def close_game(self, event):
        message = event['message']
        await self.close()