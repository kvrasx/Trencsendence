import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import date
from user_management.models import User
from chat.models import Invitations
from user_management.viewset_match import MatchTableViewSet
from django.shortcuts import get_object_or_404
from user_management.serializers import UserSerializer
from ping_pong.players_manager import player_manager

import asyncio

winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
]

class MatchXO:
    def __init__(self, player1: User, player2: User):
        self.player1 = player1
        self.player2 = player2
        self.roles = {
            str(self.player1.id): "X",
            str(self.player2.id): "O"
        }
        self.turn = self.player1.id
        self.board = {}
        self.finished = False
        

class GameConsumer(AsyncWebsocketConsumer):
    connected_users = []
    matchs = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.match = None

    async def add_player_to_lobby(self):
        print(len(self.connected_users))
        if len(self.connected_users) == 0:
            self.room_group_name = f"xo_random_{self.user.id}"
            self.connected_users.append(self.user)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        else:
            player1: User = self.connected_users.pop(0)
            if player1.id == self.user.id:
                print("la ilaha ila lah")
                self.connected_users.append(player1)
                return
            self.room_group_name = f"xo_random_{player1.id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.matchs[ self.room_group_name ] = MatchXO(player1, self.user)
            await self.game_started()


    async def connect(self):
        self.user: User = self.scope["user"]
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        
        is_added = await player_manager.add_player(self.user.id)
        if not is_added:
            await self.accept()
            await self.close(code=4009)
            return

        if self.scope['url_route']['kwargs']['room_name'] == 'random':
            await self.add_player_to_lobby()
        else:
            await self.accept()
            await self.close(code=4007)
            return

        await self.accept()
        



    async def receive(self, text_data=None):
        if self.match is None or self.match.finished:
            return
        data = json.loads(text_data)
        print(self.match.roles, self.match.turn, self.user.id)
        if data.get("action") == "move":
            if self.match.roles[str(self.user.id)] != data.get("symbol") or self.match.turn != self.user.id:
                return
            if data.get("cellId") in self.match.board:
                return
            self.match.board[str(data.get("cellId"))] = data.get("symbol")
            self.match.turn = self.match.player1.id if self.match.turn == self.match.player2.id else self.match.player2.id
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
            if self.check_winner() and not self.match.finished:
                self.match.finished = True
                await database_sync_to_async(MatchTableViewSet.createMatchEntry)({
                    "game_type": 2,
                    "winner": self.user.id,
                    "loser": self.match.player1.id if self.match.player2.id == self.user.id else self.match.player2.id,
                    "score": "01:00"
                })
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "group_message",
                        "message": {
                            "action": "game_over",
                            "status": "finished",
                            "winner": self.user.username,
                            "loser": self.match.player1.username if self.match.player2.id == self.user.id else self.match.player2.username
                        }
                    }
                )
            elif len(self.match.board) == 9:
                # Reset the game board
                self.match.board = {}
                
                # Reset the turn to the starting player
                self.match.turn = self.match.player1.id if self.match.turn == self.match.player2.id else self.match.player2.id
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "group_message",
                        "message": {
                            "action": "game_over",
                            "board": self.match.board,
                            "status": "draw",
                        }
                    }
                )
        

    async def disconnect(self, close_code):
        if close_code == 4008 or close_code == 4009:
            return

        await player_manager.remove_player(self.user.id)

        if self.match:
            # await database_sync_to_async(MatchTableViewSet.createMatchEntry)({
            #         "game_type": 2,
            #         "winner": self.match.player1.id if self.match.player2.id == self.user.id else self.match.player2.id,
            #         "loser": self.user.id,
            #         "score": "01:00"
            #     })
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "group_message",
                    "message": {
                        "action": "game_over",
                        "status": "finished",
                        "winner": self.match.player1.username if self.match.player2.id == self.user.id else self.match.player2.username,
                        "loser": self.user.username
                    }
                }
            )
            

        # remove the user from connected users if present
        if self.user and self.user in self.connected_users:
            self.connected_users.remove(self.user)
        
        # remove the match associated with this room group
        if self.room_group_name and self.room_group_name in self.matchs:
            del self.matchs[self.room_group_name]
        
        # discard the channel from the group
        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        
        
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
            if self.match.board.get(str(combination[0])) == self.match.board.get(str(combination[1])) == self.match.board.get(str(combination[2])) != None:
                return True
        return False

    async def group_message(self, event):
        await self.send(text_data=json.dumps(
            event["message"]
        ))

    async def start_group_match(self, event):
        self.match = self.matchs[self.room_group_name]
        await self.send(text_data=json.dumps({
            "action": "game_start",
        }))


        await self.send(text_data=json.dumps({
            "action": "assign_symbol",
            "symbol": self.match.roles[str(self.user.id)],
            "opponent": UserSerializer(instance=self.match.player1).data if self.match.player1.id != self.user.id else UserSerializer(instance=self.match.player2).data
        }))

    async def close_socket(self, event):
        await self.close()


                
