import { useState } from 'react';
import { GraduationCap, Users, Shield, ArrowLeft } from 'lucide-react';
import { loginApi } from '../api/client'; 

interface LoginPageProps {
  role: 'student' | 'organizer' | 'admin';
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export function LoginPage({ role, onLoginSuccess, onBack }: LoginPageProps) {
  const [username, setUsername] = useState('');   // this will actually be the email
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleConfig = {
    student: {
      title: 'Student',
      icon: GraduationCap,
    },
    organizer: {
      title: 'Organizer',
      icon: Users,
    },
    admin: {
      title: 'Administrator',
      icon: Shield,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // backend expects EMAIL + password; we use the "username" field as email
      const resp = await loginApi(username, password);
      onLoginSuccess(resp.access_token);
    } catch (err) {
      console.error(err);
      setError('Autentificare eșuată. Verificați emailul și parola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-indigo-700 text-white px-6 py-4 rounded-t-lg flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-indigo-600 p-1 rounded transition-colors"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">USV Events</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Role Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-indigo-700" />
            </div>
            <h2 className="text-gray-800 text-lg font-medium">{config.title}</h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Nume utilizator
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-indigo-700 outline-none transition-colors"
                placeholder="Introduceți emailul"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Parola
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-indigo-700 outline-none transition-colors"
                placeholder="Introduceți parola"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-3 rounded-lg hover:bg-indigo-800 transition-colors mt-8 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Se conectează...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-indigo-700 h-8 rounded-b-lg" />
      </div>
    </div>
  );
}
