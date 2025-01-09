from django.urls import path
from .consumers import ChatConsumer,count

websocket_urlpatterns = [
    path('ws/chat/', ChatConsumer.as_asgi()),  # Define the WebSocket path
    path('ws/chat/<str:room>/', ChatConsumer.as_asgi()),  # Define the WebSocket path
    path('ws/', count.as_asgi()),  # Define the WebSocket path
]
