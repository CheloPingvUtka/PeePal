from django.db import models


class Review(models.Model):
    location = models.ForeignKey('location.Location', on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    rating_clean = models.PositiveIntegerField()
    rating_access = models.PositiveIntegerField()
    rating_other = models.PositiveIntegerField(blank=True, null=True)
    text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "review"


class Photo(models.Model):
    location = models.ForeignKey('location.Location', on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, blank=True, null=True)
    photo_url = models.URLField()

    class Meta:
        db_table = "photo"
