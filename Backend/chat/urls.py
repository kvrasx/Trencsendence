from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend,invitationStatus
from .consumers import ChatConsumer

urlpatterns = [
    path('invite/', inviteFriend),
    path('accept/', acceptFriend),
    path('decline/', declineFriend),
    path('blockFriend/', blockFriend),
    path('deblockFriend/', deblockFriend),

    path('getNotifications/', getNotifications),
    path('getChats/', getChats),
    path('getMessages/<int:chat>', getMessages),
    path('invitation-status/<str:type>/<int:target>', invitationStatus),
]
