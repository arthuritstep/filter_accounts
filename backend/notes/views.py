from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Note

@api_view(["GET"])
def get_users(request):
    users = User.objects.all().order_by("id")

    data = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        for user in users
    ]

    return Response(data)


@api_view(["POST"])
def create_note(request):
    user_id = request.data.get("user_id")
    text = request.data.get("text", "")

    if not user_id:
        return Response(
            {"error": "Выберите пользователя"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not isinstance(text, str) or not text.strip():
        return Response(
            {"error": "Введите текст заметки"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=user_id)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response(
            {"error": "Пользователь не найден"},
            status=status.HTTP_404_NOT_FOUND,
        )

    note = Note.objects.create(
        user=user,
        text=text.strip(),
    )

    return Response(
        {
            "message": "Заметка создана",
            "user_id": user.id,
            "text": note.text,
        },
        status=status.HTTP_201_CREATED,
    )