from django.urls import path, include
from .views import addMsg, showMsgs

urlpatterns = [
    path('addMsg/<str:param1>/', addMsg),
    path('showMsgs/<int:param1>/', showMsgs),
]
