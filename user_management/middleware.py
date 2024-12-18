import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Try to get the access token from cookies
        headers = dict(scope['headers'])
        cookies = headers.get(b'cookie', b'').decode('utf-8')
        
        # Extract access token from cookies
        access_token = None
        for cookie in cookies.split('; '):
            if cookie.startswith('access_token='):
                access_token = cookie.split('=')[1]
                break
        
        # If no token found, continue with anonymous user
        if not access_token:
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)
        
        # Validate the JWT token
        try:
            # Decode the token using your JWT settings
            decoded_token = jwt.decode(
                access_token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            # Get the user
            user = await self.get_user(decoded_token['user_id'])
            
            # Attach user to scope
            scope['user'] = user
        except jwt.ExpiredSignatureError:
            # Token has expired
            scope['user'] = AnonymousUser()
        except (jwt.InvalidTokenError, KeyError):
            # Invalid token or missing user_id
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
