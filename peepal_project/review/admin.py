from django.contrib import admin
from .models import Review, Photo

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    pass

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    pass