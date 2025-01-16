from django.urls import path
from .views import CreateTournament, getTournament, cancelTournament


urlpatterns = [
    path('tournament/create', CreateTournament.as_view()),
    path('tournament/get', getTournament.as_view()),
    path('tournament/cancel', cancelTournament.as_view()),
]
