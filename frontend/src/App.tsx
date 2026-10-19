import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

type GameResult = {
  id: number;
  player_name: string;
  attempts: number;
  result: "win" | "lose";
};

const API_URL = "http://127.0.0.1:8000/game-results/";
const MAX_ATTEMPTS = 10;

function App() {
  const [playerName, setPlayerName] = useState("");
  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [hint, setHint] = useState("");
  const [history, setHistory] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get<GameResult[]>(API_URL);
      setHistory(response.data);
      setError("");
    } catch {
      setError("Не удалось загрузить историю игр.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchResults();
  }, []);

  const startGame = () => {
    if (!playerName.trim()) {
      setError("Сначала введи своё имя.");
      return;
    }

    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setGuess("");
    setHint("");
    setResult(null);
    setGameOver(false);
    setGameStarted(true);
    setError("");
  };

  const saveResult = async (
    finalResult: "win" | "lose",
    totalAttempts: number
  ) => {
    try {
      setSaving(true);
      setError("");

      const response = await axios.post<GameResult>(API_URL, {
        player_name: playerName.trim(),
        attempts: totalAttempts,
        result: finalResult,
      });

      setHistory((previous) => [response.data, ...previous]);
    } catch {
      setError(
        "Игра завершена но результат не удалось сохранить. Проверь Django и попробуй обновить историю."
      );
    } finally {
      setSaving(false);
    }
  };

  // Проверяем число
  const checkGuess = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (secretNumber === null || gameOver) return;

    const number = Number(guess);

    if (
      guess.trim() === "" ||
      !Number.isInteger(number) ||
      number < 1 ||
      number > 100
    ) {
      setHint("Введи целое число от 1 до 100.");
      return;
    }

    const totalAttempts = attempts + 1;
    setAttempts(totalAttempts);
    setGuess("");

    let finalResult: "win" | "lose" | null = null;

    if (number === secretNumber) {
      setHint("Угадано Ты победил");
      finalResult = "win";
    } else if (totalAttempts >= MAX_ATTEMPTS) {
      setHint(`Попытки закончились Число было ${secretNumber}.`);
      finalResult = "lose";
    } else if (number < secretNumber) {
      setHint("Загаданное число больше");
    } else {
      setHint("Загаданное число меньше");
    }

    if (finalResult !== null) {
      setResult(finalResult);
      setGameOver(true);
      setGameStarted(false);
      await saveResult(finalResult, totalAttempts);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setSecretNumber(null);
    setGuess("");
    setAttempts(0);
    setHint("");
    setResult(null);
    setError("");
  };

  return (
    <main className="page">
      <div className="game-layout">
        <section className="game-card">
          <div className="game-icon">🎯</div>
          <p className="eyebrow">NUMBER CHALLENGE</p>
          <h1>Угадай число</h1>
          <p className="subtitle">
            Компьютер загадал число от 1 до 100
          </p>

          {!gameStarted && !gameOver && (
            <form
              className="start-form"
              onSubmit={(event) => {
                event.preventDefault();
                startGame();
              }}
            >
              <label htmlFor="playerName">Имя игрока</label>
              <input
                id="playerName"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                placeholder="Введи своё имя"
                maxLength={100}
              />
              <button className="primary-button" type="submit">
                 Начать игру
              </button>
            </form>
          )}

          {gameStarted && (
            <>
              <div className="attempt-counter">
                <span>Попытки</span>
                <strong>
                  {attempts} / {MAX_ATTEMPTS}
                </strong>
              </div>

              <div className="attempt-track">
                <div
                  className="attempt-progress"
                  style={{
                    width: `${(attempts / MAX_ATTEMPTS) * 100}%`,
                  }}
                />
              </div>

              <form className="guess-form" onSubmit={checkGuess}>
                <label htmlFor="guess">Твоё число</label>
                <input
                  id="guess"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  placeholder="Например, 50"
                  autoFocus
                />
                <button className="primary-button" type="submit">
                  Проверить
                </button>
              </form>

              {hint && <div className="hint-box">{hint}</div>}
            </>
          )}

          {gameOver && (
            <div className={`result-box ${result}`}>
              <div className="result-emoji">
                {result === "win" ? "🏆" : "😿"}
              </div>
              <h2>
                {result === "win" ? "Ты победил!" : "Игра окончена"}
              </h2>
              <p>
                {result === "win"
                  ? `Ты угадал число за ${attempts} попыток!`
                  : `Ты использовал все ${MAX_ATTEMPTS} попыток.`}
              </p>
              {saving && <p>Сохраняем результат...</p>}
              <button
                className="primary-button"
                onClick={resetGame}
                type="button"
                disabled={saving}
              >
                Начать заново
              </button>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="history-card">
          <div className="history-heading">
            <div>
              <p className="eyebrow">LEADERBOARD</p>
              <h2>История игр</h2>
            </div>
            <button
              className="refresh-button"
              onClick={() => void fetchResults()}
              disabled={loading}
              type="button"
              title="Обновить результаты"
            >
              ↻
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Загружаем результаты...</p>
          ) : history.length === 0 ? (
            <p className="empty-state">
              Пока результатов нет. Сыграй первым
            </p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-avatar">
                    {item.result === "win" ? "🏆" : "🎮"}
                  </div>
                  <div className="history-info">
                    <strong>{item.player_name}</strong>
                    <span>
                      Попыток: {item.attempts}
                    </span>
                  </div>
                  <span
                    className={`result-badge ${item.result}`}
                  >
                    {item.result === "win" ? "Победа" : "Поражение"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;