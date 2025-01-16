import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from .routing import websocket_urlpatterns
from user_management.middleware import JWTAuthMiddleware
from chat.consumers import TournamentBackgroundConsumer
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project_name.settings")


application = ProtocolTypeRouter({
    "channel": ChannelNameRouter({
        "tournament-background": TournamentBackgroundConsumer.as_asgi(),
    }),
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})



