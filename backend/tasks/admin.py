from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed', 'createdAt')
    list_filter = ('completed',)
    search_fields = ('title',)
