from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # homepage
    path('rfid/connect/', views.connect, name='rfid-connect'),
    path('rfid/read/', views.rfid_read, name='rfid-read'),
    path('rfid/live_summary/', views.rfid_live_summary, name='rfid_live_summary'),
    path('api/dashboard/live-tags/', views.api_dashboard_live_tags,
         name='api_dashboard_live_tags'),
    path('api/items/search/', views.api_item_search, name='api_item_search'),
    path('api/readers/status/', views.api_reader_status, name='api_reader_status'),
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/auth/logout/', views.api_logout, name='api_logout'),
    path('api/auth/me/', views.api_me, name='api_me'),
    path("api/users/", views.api_users),
    path("api/activity-logs/", views.api_activity_logs),



]


'''if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)'''


