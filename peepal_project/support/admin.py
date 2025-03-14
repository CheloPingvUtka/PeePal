from django.contrib import admin
from .models import Report, SupportChat

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    pass

@admin.register(SupportChat)
class SupportChatAdmin(admin.ModelAdmin):
    pass
