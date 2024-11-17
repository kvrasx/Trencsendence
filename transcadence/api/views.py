from django.shortcuts import render
from rest_framework.response import Response as res
from rest_framework import status
from rest_framework.decorators import api_view as api
from django.http import HttpResponse
from django.views import APIView
from .models import msg
from .serializer import myFirstSerializer

# @api(['POST'])
# def addMsg(request, param1=None):
#     serializer = myFirstSerializer(param1)
#     if serializer.is_valid():
#         serializer.save()
#         return res(serializer.data, status=status.HTTP_201_CREATED)
#     return res(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# @api(['GET'])
# def showMsgs(request,param1=None):
#     messages = msg.objects.get(id=param1)
#     serializer = myFirstSerializer(messages)
#     return res(serializer.data, status=status.HTTP_200_OK)

class addMsg(APIView):
    def post(self, request, zb,format=None):
        serializer=myFirstSerializer
        
