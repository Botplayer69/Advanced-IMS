import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { demoCredentials, useAuth } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/rbac";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  const fromPath = (location.state as LocationState | undefined)?.from?.pathname;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = signIn(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate(fromPath ?? "/", { replace: true });
  };

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-100 via-white to-emerald-100 text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <section className="hidden lg:flex flex-col justify-between p-10 bg-slate-900 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Advanced IMS</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Inventory access for managers and warehouse teams</h1>
            <p className="mt-5 text-sm text-slate-300 max-w-md">
              Sign in using one of the demo identities to experience role-aware pages and permissions.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-5">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">Demo Password</p>
            <p className="mt-2 text-2xl font-black tracking-wider">123456</p>
          </div>
        </section>

        <section className="p-7 sm:p-10">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">Use one of the hardcoded accounts below.</p>

            <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm">
              {demoCredentials.map((credential) => (
                <div key={credential.email} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-slate-800">{credential.email}</span>
                  <span className="text-slate-500">({credential.role})</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-slate-600">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@inventory.com"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-widest text-slate-600"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="123456"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Login
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
