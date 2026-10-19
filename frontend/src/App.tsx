import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

type User = {
  id: number;
  username: string;
  email: string;
};

const API_URL = "http://127.0.0.1:8000/api";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get<User[]>(
          `${API_URL}/users/`
        );

        setUsers(response.data);

        if (response.data.length > 0) {
          setUserId(String(response.data[0].id));
        }
      } catch {
        setError("Не удалось загрузить пользователей.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!userId) {
      setError("Сначала выберите пользователя.");
      return;
    }

    if (!text.trim()) {
      setError("Введите текст заметки.");
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/notes/`,
        {
          user_id: Number(userId),
          text: text.trim(),
        }
      );

      const selectedUser = users.find(
        (user) => user.id === response.data.user_id
      );

      setSuccess(
        `Заметка создана для ${
          selectedUser?.username ?? "пользователя"
        }`
      );

      setText("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            "Ошибка отправки. Проверь соединение с Django."
        );
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page">
      <section className="note-card">
        <div className="icon">📝</div>

        <h1>аккаунты и заметки</h1>
        <p className="subtitle">
          Отправь заметку выбранному пользователю
        </p>

        {loading ? (
          <p className="info">Загружаем пользователей...</p>
        ) : error && users.length === 0 ? (
          <div className="error-message">
            {error}
            <button
              type="button"
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Повторить
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="info">
            Пользователей нет. Добавь аккаунты в Django.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="user">Пользователь</label>

            <select
              id="user"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setSuccess("");
                setError("");
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email || "без email"})
                </option>
              ))}
            </select>

            <label htmlFor="note">Текст заметки</label>

            <textarea
              id="note"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setSuccess("");
                setError("");
              }}
              placeholder="Не забыть сделать домашку..."
              rows={4}
            />

            {error && (
              <div className="error-message">{error}</div>
            )}

            {success && (
              <div className="success-message">{success}</div>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={sending || !userId}
            >
              {sending ? "Отправка..." : "✉️ Отправить"}
            </button>
          </form>
        )}

        <div className="bottom-note">
          <span>🔒</span> Django API · Axios
        </div>
      </section>
    </main>
  );
}

export default App;