import { useState } from "react";
import { FAMILY_LOGINS } from "../lib/family";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "./Spinner";

export function Login() {
  const { signIn } = useAuth();
  const [selected, setSelected] = useState<(typeof FAMILY_LOGINS)[number] | null>(
    null,
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setLoading(true);
    setError(null);

    const { error } = await signIn(selected.email, password);

    setLoading(false);
    if (error) setError("Senha incorreta.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="animate-pop-in w-full max-w-sm rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <h1 className="mb-1 text-lg font-semibold">SARMONEYAPP</h1>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          Quem é você?
        </p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {FAMILY_LOGINS.map((person) => (
            <button
              key={person.email}
              type="button"
              onClick={() => setSelected(person)}
              className={
                "rounded-lg px-2 py-2 text-sm transition-all duration-200 active:scale-95 " +
                (selected?.email === person.email
                  ? "border border-emerald-600 bg-emerald-600/10 font-medium text-emerald-700 shadow-sm dark:text-emerald-400"
                  : "border border-black/10 hover:border-black/30 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/30 dark:hover:bg-white/[0.04]")
              }
            >
              {person.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!selected || !password || loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading && <Spinner className="h-4 w-4" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
