from django.urls import path, include
from .views import getMessages,getChats,addFriend,index
from .consumers import ChatConsumer

urlpatterns = [
    path('addfriend/', addFriend),
    path('getMessages/<int:chat>', getMessages),
    path('getchats/<int:user_id>', getChats),
    path('', index),
]
