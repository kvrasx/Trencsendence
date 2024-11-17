from django.db import models

# Create your models here.

class msg(models.Model):
    # sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)