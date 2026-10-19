from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
<<<<<<< HEAD
    path("", include("game.urls")),
=======
    path("", include("notes.urls")),
>>>>>>> 150a3b066e5ebecbfffbb60064897bbac6e0dcae
]