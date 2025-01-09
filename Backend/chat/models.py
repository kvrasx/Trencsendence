from django.db import models

class Invitations(models.Model):
    
    class TypeClass(models.TextChoices):
        PENDING = "pending"
        ACCEPTED = "accepted"
        BLOCKED = "blocked"
    
    class InvitationType(models.TextChoices):
        GAME = "game"
        FRIEND = "friend"
        TOURNAMENT = "tournament"
    
    friendship_id = models.AutoField(primary_key=True)
    user1 = models.IntegerField()
    user2 = models.IntegerField()
    status = models.CharField(max_length=8, choices=TypeClass.choices, default=TypeClass.PENDING)
    type = models.CharField(max_length=10, choices=InvitationType.choices)
    
    
    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(fields=['user1', 'user2'], name='unique_user_pair')
    #     ]


class Message(models.Model):
    chat_id = models.ForeignKey(Invitations, on_delete=models.CASCADE, related_name="messages")
    sender_id = models.IntegerField()
    msg = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    
    def formatted_sent_at(self):
        return self.sent_at.strftime('%Y-%m-%d %H:%M:%S')


class NotifCountmodel(models.Model):
    # user_id = models.ForeignKey(Invitations, on_delete=models.CASCADE)
    user_id = models.IntegerField()
    count = models.IntegerField()
