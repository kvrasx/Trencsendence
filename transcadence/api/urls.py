from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,index,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend
from .consumers import ChatConsumer

urlpatterns = [
    path('inviteFriend/', inviteFriend),
    path('getNotifications/<int:user_id>', getNotifications),
    path('acceptFriend', acceptFriend),
    path('declineFriend/<int:user1>/<int:user2>', declineFriend),
    path('blockFriend/<int:user1>/<int:user2>', blockFriend),
    path('deblockFriend/<int:user1>/<int:user2>', deblockFriend),
    path('getMessages/<int:chat>', getMessages),
    path('getchats/<int:user_id>', getChats),
    path('', index),
]
