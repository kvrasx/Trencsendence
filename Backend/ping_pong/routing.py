from django.urls import re_path
from .consumers import GameClient


pong_urlpatterns = [
    re_path(r'ws/ping_pong/(?P<room_name>\w+)(?:/(?P<tournament_id>\d+))?/$', GameClient.as_asgi()),
]

