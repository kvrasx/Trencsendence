from .models import User
from rest_framework.response import Response # for the response class
from rest_framework.decorators import api_view # for the api_view decorators (eg: @api_view(['GET']))
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError


# for User table
class UserTableViewSet:

    @api_view(['POST'])
    def createUser(request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # return Response({"user": serializer.data})
        return Response({"success": "Account created successfully."}, status=200)

    ######################

    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def getAllUsers(request):
        search_query = request.query_params.get('search', '')
        if search_query:
            allUsers = User.objects.filter(username__icontains=search_query)
        else:
            allUsers = User.objects.all()
        serializer = UserSerializer(instance=allUsers, many=True)
        return Response(serializer.data)

    ########################

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def updateUser(request):
        user = request.user
        serializer = UserSerializer(instance=user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for field in request.data:
            if field not in serializer.fields:
                return Response({'error': "User have no such field."}, status=400)
        try:
            serializer.save()
        except IntegrityError as e:
            return Response({'error': str(e)}, status=400)

        return Response({'user': serializer.data})
    
    ########################

    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def getInfo(request):
        userId = request.GET.get('user_id', None)
        if userId:
            try:
                userId = int(userId)
            except:
                raise ValidationError({'error': 'Invalid user_id.'})
        else:
            data = UserSerializer(instance=request.user).data
            data["online"] = True
            return Response(data, status=200)
        user = get_object_or_404(User, id=userId)
        serializer = UserSerializer(instance=user)
        return Response(serializer.data)

