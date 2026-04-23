# chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.room_list, name='room_list'),
    path('register/', views.register, name='register'),
    path('create-room/', views.create_room, name='create_room'),
    path('room/<int:room_id>/', views.room_detail, name='room_detail'),
    path('room/<int:room_id>/send/', views.send_message, name='send_message'),
    path('room/<int:room_id>/messages/', views.get_messages, name='get_messages'),
]