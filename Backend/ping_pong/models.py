from django.db import models
from user_management.models import User, Match

class Tournament(models.Model):
    # tournamentID = models.PositiveIntegerField(primary_key=True)  # Unique ID for the tournament
    tournamentID = models.PositiveIntegerField()  # Unique ID for the tournament
    tournament_name = models.CharField(max_length=14)  # Name of the tournament
    available_players = models.IntegerField(default=1)  # Number of players available

    # Positions for users in the tournament
    position1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position1') 
    position2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position2')
    position3 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position3')
    position4 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position4')
    position5 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position5')
    position6 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position6')
    position7 = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='position7')

    status = models.CharField(max_length=30, default="ongoing")  # Status of the tournament
    current_round = models.IntegerField(default=1)  # Current round of the tournament

    match1 = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, related_name='match1')
    match2 = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, related_name='match2')
    match3 = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, related_name='match3')

    def __str__(self):
        return f"Tournament {self.tournamentID}: name of tournament is {self.tournament_name},  {self.available_players} players available"
    
    def readytoplay(self):
        if self.available_players == 4:
            return True
        return False
    
    class Meta: # prevent multiple ongoing tournaments from the same user
        constraints = [
            models.UniqueConstraint(fields=['tournamentID', 'status'], condition=models.Q(status='ongoing'), name='unique_ongoing_tournament')
        ]
