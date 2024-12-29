from django.db import models
from django.core.validators import RegexValidator
import uuid
from datetime import datetime as d

from django.contrib.auth.models import AbstractUser


def generate_avatar_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"avatars/{d.now().strftime('%Y/%m/%d')}/{str(uuid.uuid4())}.{ext}"
    return filename


class User(AbstractUser):
    id = models.AutoField(primary_key=True, unique=True)
    display_name = models.CharField(
        max_length=24, 
        null=True, 
        unique=True, 
        blank=True, 
        validators=[RegexValidator(
            regex=r'^.{5,}$', 
            message='Display name must be at least 5 characters long'
        )]
    ) # Must be unique
    avatar = models.ImageField(upload_to=generate_avatar_path, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)
    online = models.BooleanField(default=True)

    two_factor_status = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=254, unique=True, null=True, default=None)
    pass_to_2fa = models.BooleanField(default=False)

    # Override email to make it unique
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=144, null=True) # will be hashed

    # Set email as a required field for registration
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username}: {self.id}"


class Match(models.Model):
    class GameChoices(models.IntegerChoices):
        PINGPONG = 1 #, "Ping Pong"
        DICE = 2 #, "Dice"
    match_id = models.AutoField(primary_key=True)
    game_type = models.IntegerField(choices=GameChoices.choices)
    winner = models.ForeignKey(User, related_name='match_winner', on_delete=models.CASCADE) # If the user got removed -> The match is removed
    loser = models.ForeignKey(User, related_name='match_loser', on_delete=models.CASCADE)
    score = models.CharField(
        max_length=5,
        validators=[RegexValidator(
            regex=r'^\d{2}:\d{2}$',
            message='Score must be in format nn:nn'
        )]
    )
    match_date = models.DateField(auto_now_add=True)
