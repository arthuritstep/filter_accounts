from django.urls import path
from .views import game_results

urlpatterns = [
    path("game-results/", game_results, name="game_results"),
]
