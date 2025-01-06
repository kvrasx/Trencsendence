from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
# import asyncio
import threading
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from chat.models import Invitations


        
class Match:
    def __init__(self, player_1, player_2, group_name):
        self.player1 = player_1
        self.player2 = player_2
        self.group_name = group_name
        self.is_active = True

    def players(self):
        return [self.player1, self.player2, self.group_name, self.is_active]
    
    


class Ball:
    def __init__(self,x, y, radius, speedX, speedY, angle, canvasW, canvasH, constSpeed, scoreRight, scoreLeft):
        self.x = x
        self.y = y
        self.radius = radius
        self.speedX = speedX
        self.speedY = speedY
        self.angle = angle
        self.canvas_width = canvasW
        self.canvas_height = canvasH
        self.constSpeed = constSpeed
        self.scoreRight = scoreRight
        self.scoreLeft = scoreLeft
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
    def __init__(self, paddleWidth, paddleHeight, paddleX, paddleY, paddleSpeed, paddleBord, paddleScore, canvasHeight, canvasWidth):
        self.paddleWidth = paddleWidth
        self.paddleHeight = paddleHeight
        self.paddleX = paddleX
        self.paddleY = paddleY
        self.paddleSpeed = paddleSpeed
        self.paddleBord = paddleBord
        self.paddleScore = paddleScore
        self.canvasHeight = canvasHeight
        self.canvasWidth = canvasWidth
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
    # player1 = ''
    # player2 = ''
    
    ball = Ball(
        x=canvasWidth // 2,
        y=canvasHeight // 2,
        radius=10,
        speedX=3,
        speedY=3,
        angle=0,
        canvasW=canvasWidth,
        canvasH=canvasHeight,
        constSpeed=0.3,
        scoreLeft=0,
        scoreRight=0
    )
    paddleRight = Paddle(
        paddleWidth=10,
        paddleHeight=100,
        paddleX=canvasWidth * 0.98,
        paddleY=100,
        paddleSpeed=10,
        paddleBord=10,
        paddleScore=0,
        canvasHeight=canvasHeight,
        canvasWidth=canvasWidth
    )
    paddleLeft = Paddle(
        paddleWidth=10,
        paddleHeight=100,
        paddleX=canvasWidth * 0.01,
        paddleY=100,
        paddleSpeed=10,
        paddleBord=10,
        paddleScore=0,
        canvasHeight=canvasHeight,
        canvasWidth=canvasWidth
    )
    
    
    async def start_match(self, event):
        await self.send(json.dumps({
            'type': 'game_started',
            'information': self.player,
            'started': 'yes',
            'paddleRight': self.paddleRight.to_dict(),
            'paddleLeft': self.paddleLeft.to_dict(),
            'ball': self.ball.to_dict()
        }))
    
    async def connect(self):

        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        self.room_name =  self.scope['url_route']['kwargs']['room_name']
        # if self.connected_sockets[0]['player_username'] == self.user.username:
        #     await self.accept()
        #     await self.close(code=4008)
        #     return 
        if len(self.connected_sockets) == 1:
            print(self.connected_sockets[0]['player_username'])
        self.player = {
            'player_name': self.channel_name,
            'player_number': '',
            'player_username': self.user.username
        }
        await self.accept()
        if self.room_name == 'random':
            self.group_name = f'group_{self.user.username}'
            if len (self.connected_sockets) % 2 == 0:
                self.player['player_number'] = '2'
            else:
                self.player['player_number'] = '1'
            self.connected_sockets.append(self.player)
            
            if len(self.connected_sockets) == 2:
                player1 = self.connected_sockets.pop(0)
                player2 = self.connected_sockets.pop(0)
                self.group_name = f'group_{player1["player_username"]}'
                self.new_match = Match(player1, player2, self.group_name)
                await self.channel_layer.group_add(self.new_match.group_name, player1['player_name'])
                await self.channel_layer.group_add(self.new_match.group_name, player2['player_name'])
                self.active_matches.append(self.new_match)
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
                print("invite id:", inviteId)
                invite = await database_sync_to_async(get_object_or_404)(Invitations, friendship_id=inviteId, type='friend', status="accepted")
                print("hmm:", invite)
                if invite.user1 != self.user.id and invite.user2 != self.user.id:
                    # await self.accept()
                    await self.close(code=4006)
                    return
                self.group_name = f"xo_{inviteId}"

                if self.group_name in self.invite_matches:
                    self.invite_matches[ self.group_name ].append(self.user.id)
                else:
                    self.invite_matches[ self.group_name ] = [ self.user.id ]

                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )

                if (len(self.invite_matches[ self.group_name ]) != 2):
                    self.player['player_number'] = '1'
                else:
                    self.player['player_number'] = '2'
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            "type": "start_match",
                        }
                    )
                    self.new_match.is_active = True
                    asyncio.create_task(self.start_ball_movement())
    
            except Exception as e:
                print(e)
                # await self.accept()
                await self.close(code=4007)
                return
                

    async def disconnect(self, close_data):
        if hasattr(self, "group_name"):
            remove_match = None
            for match in self.active_matches:
                if match.group_name == self.group_name:
                    remove_match = match
                    break
            if remove_match:
                remove_match.is_active = False
                print(remove_match.is_active)
                print(self.remove_match.is_active)
                self.active_matches.remove(remove_match)
                await self.channel_layer.group_discard(remove_match.group_name, remove_match.player1["player_name"])                
                await self.channel_layer.group_discard(remove_match.group_name, remove_match.player2["player_name"])                



    async def receive(self, text_data):
       
        try:
            data = json.loads(text_data)
        except Exception as e:
            print("error :", e)
        if data['type'] == 'paddleMove':
            if data['playerNumber'] == '1':
                self._move_paddle(self.paddleRight, data['direction'])
            elif data['playerNumber'] == '2':
                self._move_paddle(self.paddleLeft, data['direction'])
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'paddleMoved',
                    'playerNumber': data['playerNumber'],
                    'updateY': self.paddleRight.to_dict() if data['playerNumber'] == '1' else self.paddleLeft.to_dict()
                }
            )
                
                
    def _move_paddle(self, paddle, direction):
        if direction == 'up' and paddle.paddleY > 0:
            paddle.paddleY -= 10
        elif direction == 'down' and paddle.paddleY < (paddle.canvasHeight - paddle.paddleHeight):
            paddle.paddleY += 10
                
    
    async def game_started(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'paddleRight': event['paddleRight'],
            'paddleLeft': event['paddleLeft'],
            'information': event['information'],
            'ball': event['ball']
        }))



    async def start_ball_movement(self):
        while self.new_match.is_active:
            # Update the ball's position
            self.ball.x += self.ball.speedX
            self.ball.y += self.ball.speedY

            # Check for collision with the top and bottom boundaries
            if self.ball.y - self.ball.radius <= 0 or self.ball.y + self.ball.radius >= self.ball.canvas_height:
                self.ball.speedY *= -1  # Reverse the vertical direction

            if await self._check_paddle_collision(self.paddleLeft, "left"):
                self.ball.speedX *= -1  # Reverse the horizontal direction
            if await self._check_paddle_collision(self.paddleRight, "Right"):
                self.ball.speedX *= -1

            if self.ball.x - self.ball.radius <= 0:
                await self._reset_ball(self.paddleRight, "Right")  # Reset the ball to the center 
            if self.ball.x + self.ball.radius >= self.ball.canvas_width:
                await self._reset_ball(self.paddleLeft, "Left")


            # Broadcast the updated ball position to the group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'ballUpdated',
                    'ball': self.ball.to_dict()
                }
            )
            # Control the frame rate (e.g., 60 FPS)
            await asyncio.sleep(1/60)

    
    async def ballUpdated(self, event):
        await self.send(json.dumps({
            'type': event['type'], 
            'ball': event['ball'] 
        }))

    async def _check_paddle_collision(self, paddle, lORr):

        if (lORr == "left"):
            if self.ball.x - self.ball.radius <= paddle.paddleX + paddle.paddleWidth and self.ball.y - self.ball.radius >= paddle.paddleY and self.ball.y + self.ball.radius <= paddle.paddleY + paddle.paddleHeight: 
               return True
            else:
               return False
        if (lORr == "Right"):
            if self.ball.x + self.ball.radius >= paddle.paddleX and self.ball.y - self.ball.radius >= paddle.paddleY and  self.ball.y + self.ball.radius <= paddle.paddleY + paddle.paddleHeight:
                return True
            else:
                return False
        
        
        
    async def _reset_ball(self, paddle, lorr):
        self.ball.x = self.ball.canvas_width // 2
        self.ball.y = self.ball.canvas_height // 2
        self.ball.speedX *= -1  # Reverse the horizontal direction
        if lorr == "Left":
            print ("left")
            self.ball.scoreRight += 1
        if lorr == "Right":
            print ("Right")
            self.ball.scoreLeft += 1


    async def paddleMoved(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'playerNumber': event['playerNumber'],
            'updateY': event['updateY']
        }))
    
    
    

