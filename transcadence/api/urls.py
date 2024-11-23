from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,index,getNotifications,acceptFriend
from .consumers import ChatConsumer

urlpatterns = [
    path('inviteFriend/', inviteFriend),
    path('getMessages/<int:chat>', getMessages),
    path('getchats/<int:user_id>', getChats),
    path('acceptFriend', acceptFriend),
    path('getNotifications/<int:user_id>', getNotifications),
    path('', index),
]
