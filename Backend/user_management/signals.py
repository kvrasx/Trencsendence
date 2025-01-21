from django.db.models.signals import post_save, post_migrate
from .models import User
from django.dispatch import receiver
from chat.models import Invitations

@receiver(post_migrate)
def create_bot_user(sender, **kwargs):
    # Replace 'username' and 'email' with desired bot details
    bot_username = "bot"
    bot_email = "bot@example.com"
    bot_password = None # Use a strong password

    # Check if the bot user already exists
    if not User.objects.filter(username=bot_username).exists():
        User.objects.create_user(
            username=bot_username,
            email=bot_email,
            password=bot_password,
        )
        print(f"Bot user '{bot_username}' created successfully.")
    else:
        print(f"Bot user '{bot_username}' already exists.")


@receiver(post_save, sender=User)
def add_bot_friend(sender, instance, created, **kwargs):
    if created:
        bot = User.objects.get(username="bot")
        Invitations.objects.create(user1=instance.id, user2=bot.id, type='friend', status='accepted')