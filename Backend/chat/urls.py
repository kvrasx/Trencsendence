from django.urls import path, include
from .views import getMessages,getChats,inviteFriend,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend, isValidMatch
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

    path('check-match/<int:matchId>/<int:tournamentId>', isValidMatch),
    path('check-match/<int:matchId>', isValidMatch),
    path('invitation-status/<str:type>/<int:target>', invitationStatus),
]
