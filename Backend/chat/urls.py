from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,index,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend
from .consumers import ChatConsumer

urlpatterns = [
    path('api/invite/', inviteFriend),
    path('api/accept/', acceptFriend),
    path('api/decline/', declineFriend),
    path('api/blockFriend/', blockFriend),
    path('api/deblockFriend/', deblockFriend),

    path('api/getNotifications/', getNotifications),
    path('api/getChats/', getChats),
    path('api/getMessages/<int:chat>', getMessages),
]
