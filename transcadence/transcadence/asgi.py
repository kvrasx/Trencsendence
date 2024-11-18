"""
ASGI config for transcadence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""


# application = get_asgi_application()

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns  # Import the websocket routes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcadence.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Regular HTTP requests
    "websocket": AuthMiddlewareStack(  # WebSocket requests
        URLRouter(
            websocket_urlpatterns  # WebSocket URL patterns
        )
    ),
})