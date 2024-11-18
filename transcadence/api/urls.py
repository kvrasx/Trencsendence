from django.urls import path, include
from .views import addMsg, getMessages,getChats,addFriend

urlpatterns = [
    path('addFriend/<int:param1>/<int:param2>', addFriend),
    path('addMsg', addMsg),
    path('getMessages/<int:param1>/', getMessages),
    path('getChats/<int:param1>/', getChats),
]
