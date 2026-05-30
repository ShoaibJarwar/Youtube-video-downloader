from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.AnalyzeView.as_view(), name='analyze'),
    path('download/', views.DownloadView.as_view(), name='download'),
    path('progress/<str:task_id>/', views.ProgressView.as_view(), name='progress'),
    path('cancel/<str:task_id>/', views.CancelView.as_view(), name='cancel'),
    path('history/', views.HistoryListView.as_view(), name='history-list'),
    path('history/<str:pk>/', views.HistoryDeleteView.as_view(), name='history-delete'),
    path('file/<str:task_id>/', views.FileFetchView.as_view(), name='file-fetch'),
]
