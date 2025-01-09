from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
# import asyncio
import threading
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from chat.models import Invitations
from user_management.viewset_match import MatchTableViewSet
from tic_tac_toe.consumers import current_players

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
        self.canvas_height = 400
        self.canvas_width = 600
        self.x = 600 // 2
        self.y = 400 // 2
        self.radius = 10
        self.speedX = 3
        self.speedY = 3
        self.angle = 0
        self.constSpeed = 0.5
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
        self.canvasHeight = 400
        self.canvasWidth = 600
        self.paddleWidth = 10
        self.paddleHeight = 100
        self.paddleY = 100
        self.paddleSpeed = 10
        self.paddleBord = 10
        self.paddleScore = 0
        if paddle == "right":
            self.paddleX = 600 * 0.98
        else:
            self.paddleX = 600 * 0.003

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
    active_matches = []
    invite_matches = {}
    canvasHeight = 400
    canvasWidth = 600
    timeout = 30
    

    
    
    async def start_match(self, event):
        
        self.new_match = self.player["match"]

        await self.send(json.dumps({
            'type': 'game_started',
            'information': self.player["p"],
            'started': 'yes',
            'paddleRight': self.new_match.paddleRight.to_dict(),
            'paddleLeft': self.new_match.paddleLeft.to_dict(),
            'ball': self.new_match.ball.to_dict()
        }))
    
    async def connect(self):

        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        if self.user.id in current_players or (len(self.connected_sockets) == 1 and self.connected_sockets[0]['p']['player_username'] == self.user.username):
            await self.accept()
            await self.close(code=4008)
            return 
        self.room_name =  self.scope['url_route']['kwargs']['room_name']
        self.player = {
            "p": {
                'player_name': self.channel_name,
                'player_number': '',
                'player_username': self.user.username,
                'user_id': self.user.id,
            },
            "match": None
        }
        current_players.add(self.user.id)
        await self.accept()
        if self.room_name == 'random':
            self.group_name = f'group_{self.user.username}'
            if len (self.connected_sockets) % 2 == 0:
                self.player["p"]['player_number'] = '2'
            else:
                self.player["p"]['player_number'] = '1'
            self.connected_sockets.append(self.player)
            
            if len(self.connected_sockets) == 2:
                player1 = self.connected_sockets.pop(0)
                player2 = self.connected_sockets.pop(0)
                self.group_name = f'group_{player1["p"]["player_username"]}'
                self.new_match = Match(player1['p'], player2['p'], self.group_name)
                player1["match"] = self.new_match
                player2["match"] = self.new_match
                self.active_matches.append(self.new_match)
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
        else:
            try:
                inviteId = int(self.scope['url_route']['kwargs']['room_name'])
                invite = await database_sync_to_async(get_object_or_404)(Invitations, friendship_id=inviteId, type='join', status="accepted")
                if invite.user1 != self.user.id and invite.user2 != self.user.id:
                    # await self.accept()
                    await self.close(code=4006)
                    return
                self.group_name = f"xo_{inviteId}"

                if self.group_name in self.invite_matches:
                    self.invite_matches[ self.group_name ].append( self.player["p"] )
                else:
                    self.invite_matches[ self.group_name ] = [ self.player["p"] ]

                self.isInvite = True

                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                
                invitedPlayers = self.invite_matches[ self.group_name ]
                
                if (len(invitedPlayers) != 2):
                    self.player["p"]['player_number'] = '1'
                else:
                    self.player["p"]['player_number'] = '2'
                    
                    self.new_match = Match(invitedPlayers[0], invitedPlayers[1], self.group_name)
                    self.active_matches.append(self.new_match)
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            "type": "start_match",
                        }
                    )
                    invite.delete()
                    self.new_match.is_active = True
                    asyncio.create_task(self.start_ball_movement()) # need to be cleaned 
    
            except Exception as e:
                print("error: ", e)
                raise e
            
                await self.accept()
                await self.close(code=4007)
                return
                

    async def disconnect(self, close_data):
        if hasattr(self, "user"):
            try:
                current_players.remove(self.user.id)
            except:
                pass

        if hasattr(self, "group_name"):
            remove_match = None
            if len(self.connected_sockets) == 1:
                self.connected_sockets.pop(0)
            for match in self.active_matches:
                if match.group_name == self.group_name:
                    remove_match = match
                    break
            if remove_match:
                if self.new_match.ball.scoreLeft < 5 and self.new_match.ball.scoreRight < 5:
                    await self.channel_layer.group_send(
                        remove_match.group_name,
                        {
                            "type": "freee_match",
                            "winner": remove_match.player2 if remove_match.player1["player_username"] == self.user.username else remove_match.player1
                        }
                    )
                remove_match.is_active = False 
                try:
                    self.active_matches.remove(remove_match)
                except:
                    pass
                await self.channel_layer.group_discard(remove_match.group_name, remove_match.player1["player_name"])                
                await self.channel_layer.group_discard(remove_match.group_name, remove_match.player2["player_name"])  
                
        if hasattr(self, "isInvite"):
            try: 
                del self.invite_matches[self.group_name]
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
        if direction == 'up' and paddle.paddleY > 0:
            paddle.paddleY -= 10
        elif direction == 'down' and paddle.paddleY < (paddle.canvasHeight - paddle.paddleHeight):
            paddle.paddleY += 10
                
    

    async def start_ball_movement(self):
        while self.new_match.is_active:
            self.new_match.ball.x += self.new_match.ball.speedX
            self.new_match.ball.y += self.new_match.ball.speedY

            if self.new_match.ball.y - self.new_match.ball.radius <= 0 or self.new_match.ball.y + self.new_match.ball.radius >= self.new_match.ball.canvas_height:
                self.new_match.ball.speedY *= -1  # Reverse the vertical direction

            if await self._check_paddle_collision(self.new_match.paddleLeft, "left"):
                self.new_match.ball.speedX *= -1  # Reverse the horizontal direction
            if await self._check_paddle_collision(self.new_match.paddleRight, "Right"):
                self.new_match.ball.speedX *= -1

            if self.new_match.ball.x - self.new_match.ball.radius <= 0:
                await self._reset_ball(self.new_match.paddleRight, "Right")  # Reset the ball to the center 
            if self.new_match.ball.x + self.new_match.ball.radius >= self.new_match.ball.canvas_width:
                await self._reset_ball(self.new_match.paddleLeft, "Left")

            if (self.new_match.ball.scoreRight == 5 or self.new_match.ball.scoreLeft == 5):
                self.new_match.is_active = False
                score = f"0{self.new_match.ball.scoreRight}:0{self.new_match.ball.scoreLeft}"
                await database_sync_to_async(MatchTableViewSet.createMatchEntry)({
                    "game_type": 1,
                    "winner": self.new_match.player2["user_id"] if  self.new_match.ball.scoreRight == 5 else self.new_match.player1["user_id"],
                    "loser": self.new_match.player1["user_id"] if  self.new_match.ball.scoreRight == 5 else self.new_match.player2["user_id"],
                    "score": score
                })
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type" : "game_finished",
                        "winner": self.new_match.player2 if self.new_match.ball.scoreLeft == 5 else self.new_match.player1,
                        "score":  score
                    }
                )
                return ;
            
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
            if self.new_match.ball.x - self.new_match.ball.radius <= paddle.paddleX + paddle.paddleWidth and self.new_match.ball.y - self.new_match.ball.radius >= paddle.paddleY and self.new_match.ball.y + self.new_match.ball.radius <= paddle.paddleY + paddle.paddleHeight: 
               return True
            else:
                   return False
        if (lORr == "Right"):
            if self.new_match.ball.x + self.new_match.ball.radius >= paddle.paddleX and self.new_match.ball.y - self.new_match.ball.radius >= paddle.paddleY and  self.new_match.ball.y + self.new_match.ball.radius <= paddle.paddleY + paddle.paddleHeight:
                return True
            else:
                return False
        
        
        
    async def _reset_ball(self, paddle, lorr):
        self.new_match.ball.x = self.new_match.ball.canvas_width // 2
        self.new_match.ball.y = self.new_match.ball.canvas_height // 2
        self.new_match.ball.speedX *= -1  # Reverse the horizontal direction
        if lorr == "Left":
            print ("left")
            self.new_match.ball.scoreRight += 1
        if lorr == "Right":
            print ("Right")
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

