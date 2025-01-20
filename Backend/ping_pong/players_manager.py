import asyncio
from typing import Set

class PlayerManager:
    def __init__(self):
        self._players: Set[int] = set()
        self._lock = asyncio.Lock()
    
    async def add_player(self, player_id: int) -> bool:
        async with self._lock:
            if player_id in self._players:
                return False
            self._players.add(player_id)
            return True
            print(self._players)
    
    async def remove_player(self, player_id: int) -> None:
        async with self._lock:
            self._players.discard(player_id)
            print(self._players)
    
    async def is_player_active(self, player_id: int) -> bool:
        async with self._lock:
            return player_id in self._players
    
    async def get_active_players(self) -> Set[int]:
        async with self._lock:
            return self._players.copy()

# a global instance
player_manager = PlayerManager()