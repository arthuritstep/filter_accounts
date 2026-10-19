from django.urls import path
from .views import get_users, create_note

urlpatterns = [
    path("api/users/", get_users, name="get_users"),
    path("api/notes/", create_note, name="create_note"),
]
