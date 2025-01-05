import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import date
from user_management.models import Match, User
from channels.exceptions import DenyConnection
import string

winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

user1 = "player_1"
user2 = "player_2"

class MatchXO:
    def __init__(self, **kwargs):
        self.player1 = kwargs.get("player1")
        self.player2 = kwargs.get("player2")
        self.roles = {
            self.player1: "X",
            self.player2: "O"
        }
        self.turn = self.player1
        self.board = {}
        self.finished = False
        


class GameConsumer(AsyncWebsocketConsumer):
    connected_users = []
    matchs = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.player_username = None
        self.match = None

    async def add_player_to_lobby(self):
        if len(self.connected_users) == 0:
            self.room_group_name = f"xo_{self.scope['url_route']['kwargs']['room_name']}_{self.player_username}"
            self.connected_users.append(self.player_username)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        else:
            player1 = self.connected_users.pop(0)
            self.room_group_name = f"xo_{self.scope['url_route']['kwargs']['room_name']}_{player1}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.matchs[ self.room_group_name ] = MatchXO(player1=player1, player2=self.player_username)
            await self.game_started()


    async def connect(self):
        user: User = self.scope["user"]
        if user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        
        self.player_username = user.username

        if self.scope['url_route']['kwargs']['room_name'] == 'lobby':
            print(self.scope['url_route']['kwargs']['room_name'])
            await self.add_player_to_lobby()
    
        # else: Check if the player is part of the match invitation
    
        await self.accept()
        


    async def receive(self, text_data=None):
        if self.match is None or self.match.finished:
            return
        data = json.loads(text_data)
        if data.get("action") == "move":
            if self.match.roles[self.player_username] != data.get("symbol") or self.match.turn != self.player_username:
                return
            if data.get("cellId") in self.match.board:
                return
            self.match.board[data.get("cellId")] = data.get("symbol")
            self.match.turn = self.match.player1 if self.match.turn == self.match.player2 else self.match.player2
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "group_message",
                    "message": {
                        "action": "update_board",
                        "board": self.match.board
                    }
                }
            )
            if self.check_winner():
                self.match.finished = True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "group_message",
                        "message": {
                            "action": "game_over",
                            "status": "finished",
                            "winner": self.player_username,
                            "loser": self.match.player1 if self.match.player2 == self.player_username else self.match.player2
                        }
                    }
                )
            elif len(self.match.board) == 9:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "group_message",
                        "message": {
                            "action": "game_over",
                            "status": "draw",
                        }
                    }
                )
                self.match.finished = True
        

    async def disconnect(self, close_code):
        # remove the user from connected users if present
        if self.player_username and self.player_username in self.connected_users:
            self.connected_users.remove(self.player_username)
        
        # remove the match associated with this room group
        if self.room_group_name and self.room_group_name in self.matchs:
            del self.matchs[self.room_group_name]
        
        # discard the channel from the group
        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        # debug logging
        print(f"Disconnected user: {self.player_username}")
        print(f"Connected users: {self.connected_users}")
        print(f"Matches: {list(self.matchs.keys())}")

    async def game_started(self):
        print("sended start game to group")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "start_group_match",
            }
        )

    def check_winner(self):
        for combination in winningCombinations:
            if self.match.board.get(combination[0]) == self.match.board.get(combination[1]) == self.match.board.get(combination[2]) != None:
                return True
        return False

    async def group_message(self, event):
        await self.send(text_data=json.dumps(
            event["message"]
        ))

    async def start_group_match(self, event):
        self.match = self.matchs[self.room_group_name]
        await self.send(text_data=json.dumps({
            "action": "game_start"
        }))

        await self.send(text_data=json.dumps({
            "action": "assign_symbol",
            "symbol": self.match.roles[self.player_username]
        }))
                
