from django.contrib import admin
from .models import DownloadHistory


@admin.register(DownloadHistory)
class DownloadHistoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'quality', 'format', 'status', 'progress', 'created_at']
    list_filter = ['status', 'format', 'quality']
    search_fields = ['title', 'url']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
