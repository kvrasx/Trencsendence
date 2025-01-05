from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
# import asyncio
import threading


        
class Match:
    def __init__(self, player_1, player_2, group_name, match_number):
        self.player1 = player_1
        self.player2 = player_2
        self.group_name = group_name
        self.match_number = match_number
        self.is_active = True

    def players(self):
        return [self.player1, self.player2, self.group_name, self.match_number, self.is_active]
    
    


class Ball:
    def __init__(self,x, y, radius, speedX, speedY, angle, canvasW, canvasH, constSpeed):
        self.x = x
        self.y = y
        self.radius = radius
        self.speedX = speedX
        self.speedY = speedY
        self.angle = angle
        self.canvas_width = canvasW
        self.canvas_height = canvasH
        self.constSpeed = constSpeed
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
            'constSpeed': self.constSpeed
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
    canvasHeight = 400
    canvasWidth = 600
    
    ball = Ball(
        x=canvasWidth // 2,
        y=canvasHeight // 2,
        radius=10,
        speedX=3,
        speedY=3,
        angle=0,
        canvasW=canvasWidth,
        canvasH=canvasHeight,
        constSpeed=0.5
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
    
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        self.room_name =  self.scope['url_route']['kwargs']['room_name']
        self.player = {}
        await self.accept()
        if self.room_name == 'random':
            self.group_name = f'group_{self.user.username}'
            self.scope['player_name'] = self.channel_name
            self.player = {
                'player_name': self.channel_name,
                'player_number': '',
                'player_username': self.user.username
            }
            if len (self.connected_sockets) % 2 == 0:
                self.player['player_number'] = '2'
            else:
                self.player['player_number'] = '1'
            self.connected_sockets.append(self.player)
            await self.send(json.dumps({
                'type': 'connection',
                'information': self.player
            }))
            if len(self.connected_sockets) == 2:
                player1 = self.connected_sockets.pop(0)
                player2 = self.connected_sockets.pop(0)
                self.group_name = f'group_{player1["player_username"]}'
                self.new_match = Match(player1, player2, self.group_name, len(self.active_matches))
                await self.channel_layer.group_add(self.new_match.group_name, player1['player_name'])
                await self.channel_layer.group_add(self.new_match.group_name, player2['player_name'])
                self.active_matches.append(self.new_match)
                print(self.group_name)
                await self.channel_layer.send(player1['player_name'], 
                    {
                        'type': 'game_started',
                        # 'game_group': self.group_name,
                        'information': player1,
                        # 'player': player1,
                        'started': 'yes',
                        'paddleRight': self.paddleRight.to_dict(),
                        'paddleLeft': self.paddleLeft.to_dict(),
                        'ball': self.ball.to_dict()
                    })
                await self.channel_layer.send(player2['player_name'],
                    {
                        'type': 'game_started',
                        # 'game_group': self.group_name,
                        'information': player2,
                        # 'player': player2,
                        'started': 'yes',
                        'paddleRight': self.paddleRight.to_dict(),
                        'paddleLeft': self.paddleLeft.to_dict(),
                        'ball': self.ball.to_dict()
                    })
                self.is_active = True
                asyncio.create_task(self.start_ball_movement())
                




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
            # self.group_name = data['gameGroup']
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
            # 'game_group': event['game_group'],
            'paddleRight': event['paddleRight'],
            'paddleLeft': event['paddleLeft'],
            'information': event['information'],
            'ball': event['ball']
        }))
        #ball moving



    async def start_ball_movement(self):
        while self.is_active:
            # Update the ball's position
            self.ball.x += self.ball.speedX
            self.ball.y += self.ball.speedY

            # Check for collision with the top and bottom boundaries
            if self.ball.y - self.ball.radius <= 0 or self.ball.y + self.ball.radius >= self.ball.canvas_height:
                self.ball.speedY *= -1  # Reverse the vertical direction

            # # Check for collision with the paddles
            # if self._check_paddle_collision(self.paddleRight) or self._check_paddle_collision(self.paddleLeft):
            #     self.ball.speedX *= -1  # Reverse the horizontal direction

            # print("kane")
            # # Check if the ball has passed the left or right boundary
            # if self.ball.x - self.ball.radius <= 0 or self.ball.x + self.ball.radius >= self.ball.canvas_width:
            #     self._reset_ball()  # Reset the ball to the center
            if self.ball.x - self.ball.radius <= 0 or self.ball.x + self.ball.radius >= self.ball.canvas_width:
                self.ball.speedY *= -1
                self.ball.speedX *= -1

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

    async def _check_paddle_collision(self, paddle):
        return (
            self.ball.x + self.ball.radius >= paddle.paddleX and
            self.ball.x - self.ball.radius <= paddle.paddleX + paddle.paddleWidth and
            self.ball.y >= paddle.paddleY and
            self.ball.y <= paddle.paddleY + paddle.paddleHeight
        )
    async def _reset_ball(self):
        self.ball.x = self.ball.canvas_width // 2
        self.ball.y = self.ball.canvas_height // 2
        self.ball.speedX *= -1  # Reverse the horizontal direction
        self.ball.speedY = 5 if self.ball.speedY > 0 else -5  # Reset to initial vertical speed


    async def paddleMoved(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'playerNumber': event['playerNumber'],
            'updateY': event['updateY']
        }))
    
    

    async def player_disconnected(self, event):
        await self.send(json.dumps({
            'type': event['type'],
            'message': event['type']
        }))
