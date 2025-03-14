from django.db import models



class Report(models.Model):
    location = models.ForeignKey('location.Location', on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'report'


class SupportChat(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    message_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "support_chat"
