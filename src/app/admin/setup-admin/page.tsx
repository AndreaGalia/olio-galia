'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validazione
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la creazione admin');
      }

      setSuccess(true);

      // Reindirizza al login dopo 2 secondi
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante la creazione admin');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
        <div className="max-w-md w-full p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-olive/10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-olive mb-2">Admin creato con successo!</h2>
            <p className="text-nocciola mb-4">Reindirizzamento al login...</p>
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia via-beige to-sabbia/80 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-4xl font-serif text-olive mb-4">
            Setup Admin
          </h2>
          <p className="text-nocciola">
            Crea il primo account amministratore
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Attenzione:</strong> Questo endpoint è protetto. Hai bisogno del token segreto.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-olive/10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-olive mb-2">
                  Token Segreto *
                </label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-nocciola/20 rounded-xl focus:ring-2 focus:ring-olive focus:border-olive transition-colors"
                  placeholder="Token di setup (SETUP_ADMIN_TOKEN)"
                />
                <p className="mt-1 text-xs text-nocciola/70">
                  Configurato nel file .env
                </p>
              </div>

              <div className="border-t border-nocciola/10 pt-5">
                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-olive mb-2">
                    Email Admin *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-nocciola/20 rounded-xl focus:ring-2 focus:ring-olive focus:border-olive transition-colors"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block text-sm font-medium text-olive mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-nocciola/20 rounded-xl focus:ring-2 focus:ring-olive focus:border-olive transition-colors"
                    placeholder="Minimo 8 caratteri"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-olive mb-2">
                    Conferma Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-nocciola/20 rounded-xl focus:ring-2 focus:ring-olive focus:border-olive transition-colors"
                    placeholder="Ripeti la password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-olive to-salvia hover:from-salvia hover:to-olive disabled:from-nocciola disabled:to-nocciola text-white rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Creazione in corso...
                </div>
              ) : (
                'Crea Admin'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/admin/login')}
            className="text-sm text-olive hover:text-salvia transition-colors underline"
          >
            Hai già un account? Accedi
          </button>
        </div>
      </div>
    </div>
  );
}
