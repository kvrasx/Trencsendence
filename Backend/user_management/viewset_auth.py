from .models import User
from rest_framework.response import Response # for the response class
from rest_framework.decorators import api_view, permission_classes # for the api_view decorators (eg: @api_view(['GET']))
from django.shortcuts import get_object_or_404

from rest_framework import status
from django.contrib.auth.hashers import check_password # for the password hashing

from datetime import datetime
from django.conf import settings
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

from rest_framework_simplejwt.serializers import TokenRefreshSerializer



class authViewSet:

    @api_view(['POST'])
    def userLogin(request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"error": "one field or more are missing."}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, username=username)
        user.pass_to_2fa = False
        if not check_password(encoded=user.password, password=request.data["password"]):
            return Response({"error": "wrong account credentials."}, status=status.HTTP_400_BAD_REQUEST)

        r = handle_2fa(user)
        if r:
            return r

        return generate_login_response(user)


########################

    # @permission_classes([IsAuthenticated])
    @api_view(['GET'])
    def userLogout(request):
        response = Response(status=status.HTTP_200_OK, data={"success": "You logged out successfully."})
        response.set_cookie('access_token', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
        response.set_cookie('refresh_token', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
        return response

########################

    @api_view(['GET'])
    def OAuth(request):
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'Authorization code is not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
        USER_INFO_URL = 'https://api.intra.42.fr/v2/me'

        reqBody = {
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }

        res = requests.post(url=TOKEN_URL, data=reqBody)
        
        clientToken = res.json().get('access_token')
        
        if res.status_code != 200 or not clientToken:
            return Response({'error': 'Failed to fetch client access token from 42.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
        res = requests.get(
            url=USER_INFO_URL,
            headers={
                'Authorization': f'Bearer {clientToken}',
            }
        )
        clientInfo = res.json()

        if res.status_code != 200:
            return Response({'error': 'Failed to fetch client data from 42.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        login = clientInfo.get('login')
        email = clientInfo.get('email')
        avatar = clientInfo.get('image').get('link')
        user, isCreated = User.objects.get_or_create(username=login, email=email, password=None)
        if isCreated and avatar:
            user.avatar = avatar
            user.save()

        r = handle_2fa(user)
        if r:
            r.status_code = 302
            r['Location'] = 'http://localhost:5173/?otp=true&username=' + user.username
            return r

        response = generate_login_response(user)
        response.status_code = 302
        response['Location'] = 'http://localhost:5173/'
        return response

#########################

    @api_view(['GET'])
    def tokenRefresh(request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "Refresh token not found in cookies."})
        try:
            token = RefreshToken(refresh_token)
            user_id = token['user_id']
            user = User.objects.filter(id=user_id).first()
            if not user:
                print("user does not exists")
                return Response(status=status.HTTP_404_NOT_FOUND, data={"error": "User does not exist."})
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": str(e)})
        
        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        accessToken = serializer.validated_data.get("access")
        access_token_expiry = datetime.now() + settings.JWT_ACCESS_EXPIRATION_TIME
        response = Response(status=status.HTTP_200_OK, data={"success": "Access token successfully refreshed."})
        response.set_cookie(
            key="access_token",
            value=accessToken,
            expires=access_token_expiry,
            httponly=False,  
            samesite='Strict',
            path='/',
        )
        return response

################################################# END OF VIEWSETS

def generate_login_response(user):
    refreshToken = RefreshToken.for_user(user)
    accessToken = refreshToken.access_token
    response = Response(status=status.HTTP_200_OK, data={
        "success": "You logged in successfully.",
        "user": UserSerializer(instance=user).data,
    })
    
    access_token_expiry = datetime.now() + settings.JWT_ACCESS_EXPIRATION_TIME
    refresh_token_expiry = datetime.now() + settings.JWT_REFRESH_EXPIRATION_TIME

    response.set_cookie(
        key="access_token",
        value=accessToken,
        expires=access_token_expiry,
        httponly=False,  
        samesite='Strict',
        path='/',
    )
    response.set_cookie(
        key="refresh_token",
        value=refreshToken,
        httponly=True,
        expires=refresh_token_expiry,
        samesite='Strict',
        path='/',
    )
    return response

def handle_2fa(user):
    if user.two_factor_status == True and user.two_factor_secret != None:
        user.pass_to_2fa = True
        user.save()
        return Response({"success": "verify OTP."}, status=status.HTTP_301_MOVED_PERMANENTLY)
    else:
        return None