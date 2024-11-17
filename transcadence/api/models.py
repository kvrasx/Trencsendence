from django.db import models

class Chats(models.Model):
    chatId = models.AutoField(primary_key=True)
    user1_ID = models.IntegerField()
    user2_ID = models.IntegerField()

class Message(models.Model):
    chatId = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    senderId = models.IntegerField()
    msg = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True) 