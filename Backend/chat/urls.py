from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,index,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend
from .consumers import ChatConsumer

urlpatterns = [
    path('inviteFriend/', inviteFriend),
    path('acceptFriend/', acceptFriend),
    path('declineFriend/', declineFriend),
    path('blockFriend/', blockFriend),
    path('deblockFriend/', deblockFriend),

    path('getNotifications/', getNotifications),
    path('getMessages/<int:chat>', getMessages),
    path('getChats/', getChats),
    path('', index),
]
