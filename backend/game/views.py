from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import GameResult

@api_view(["GET", "POST"])
def game_results(request):
    if request.method == "GET":
        results = GameResult.objects.all().order_by("-id")

        data = [
            {
                "id": item.id,
                "player_name": item.player_name,
                "attempts": item.attempts,
                "result": item.result,
            }
            for item in results
        ]

        return Response(data)

    player_name = request.data.get("player_name", "").strip()
    attempts = request.data.get("attempts")
    result = request.data.get("result")

    if not player_name:
        return Response(
            {"error": "Введите имя игрока"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        not isinstance(attempts, int)
        or isinstance(attempts, bool)
        or attempts < 1
    ):
        return Response(
            {"error": "Количество попыток должно быть положительным числом"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if result not in ["win", "lose"]:
        return Response(
            {"error": "Результат должен быть win или lose"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    game_result = GameResult.objects.create(
        player_name=player_name,
        attempts=attempts,
        result=result,
    )

    return Response(
        {
            "id": game_result.id,
            "player_name": game_result.player_name,
            "attempts": game_result.attempts,
            "result": game_result.result,
        },
        status=status.HTTP_201_CREATED,
    )
