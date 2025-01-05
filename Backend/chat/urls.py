from django.urls import path, include
from .views import CreateTournament, getMessages,getChats,inviteFriend,index,getNotifications,acceptFriend,blockFriend,deblockFriend,declineFriend
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
    path('CreateTournament/', CreateTournament.as_view(), name='CreateTournament'),#momihamm
    path('', index),
]
