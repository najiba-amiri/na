from django.shortcuts import render

# Create your views here.
# chat/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from .models import Room, Message

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('room_list')
    else:
        form = UserCreationForm()
    return render(request, 'chat/register.html', {'form': form})

@login_required
def room_list(request):
    rooms = Room.objects.all()
    return render(request, 'chat/room_list.html', {'rooms': rooms})

@login_required
def create_room(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            room = Room.objects.create(name=name, created_by=request.user)
            return redirect('room_detail', room_id=room.id)
    return render(request, 'chat/create_room.html')

@login_required
def room_detail(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    messages = room.messages.all()
    return render(request, 'chat/room_detail.html', {
        'room': room,
        'messages': messages
    })

@login_required
def send_message(request, room_id):
    if request.method == 'POST':
        room = get_object_or_404(Room, id=room_id)
        content = request.POST.get('content')
        if content:
            Message.objects.create(
                room=room,
                user=request.user,
                content=content
            )
    return redirect('room_detail', room_id=room_id)

@login_required
def get_messages(request, room_id):
    last_id = request.GET.get('last_id', 0)
    messages = Message.objects.filter(
        room_id=room_id,
        id__gt=last_id
    ).select_related('user')
    
    data = [{
        'id': msg.id,
        'user': msg.user.username,
        'content': msg.content,
        'timestamp': msg.timestamp.strftime('%H:%M:%S')
    } for msg in messages]
    
    return JsonResponse(data, safe=False)