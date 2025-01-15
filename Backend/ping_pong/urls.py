from django.urls import path
from .views import CreateTournament


urlpatterns = [
    path('tournament/create', CreateTournament.as_view()),
]
