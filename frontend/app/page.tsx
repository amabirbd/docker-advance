"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageTitle, setPageTitle] = useState("default title");

  const loadTasks = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(`${API_URL}/api/tasks`);
      if (!response.ok)
        throw new Error("Could not load tasks. Is the API running?");
      setTasks((await response.json()) as Task[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create task.");
      setTitle("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function toggleTask(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Could not update task.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function deleteTask(id: number) {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Could not delete task.");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function loadTitle() {
    try {
      const response = await fetch(`${API_URL}/api/title`);
      if (!response.ok) throw new Error("Could not load title.");
      const data = await response.json();
      console.log(data);
      setPageTitle(data.title);
      document.title = data.title;
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    void loadTitle();
  }, []);

  return (
    <main className="container">
      <p className="eyebrow">{pageTitle}</p>
      <h1>My tasks</h1>
      <p className="intro">
        Next.js + TypeScript · Express API · PostgreSQL · Redis cache
      </p>
      <form className="task-form" onSubmit={addTask}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="What do you need to do?"
          aria-label="New task"
        />
        <button type="submit">Add task</button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <section aria-label="Task list" className="task-list">
        {loading ? (
          <p className="muted">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet. Add your first one above.</p>
        ) : (
          tasks.map((task) => (
            <article className="task" key={task.id}>
              <label
                className={
                  task.completed ? "task-title completed" : "task-title"
                }
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => void toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <button
                className="delete"
                onClick={() => void deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
              >
                Delete
              </button>
            </article>
          ))
        )}
      </section>
      <footer>
        {tasks.filter((task) => !task.completed).length} remaining
      </footer>
    </main>
  );
}
