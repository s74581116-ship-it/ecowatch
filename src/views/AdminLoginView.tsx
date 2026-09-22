import { useState } from 'react';
import { Lock, User, ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function AdminLoginView({ onLoginSuccess, onBack }: AdminLoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanUser = username.trim();

    try {
      // 1. Try server API endpoint if active
      let serverHandled = false;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password }),
        });

        // Only parse if JSON content-type
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          serverHandled = true;
          const data = await res.json();
          if (res.ok && data.success) {
            onLoginSuccess();
            return;
          } else {
            setError(data.error || 'Invalid username or password.');
            return;
          }
        }
      } catch {
        // Server API not present (static deployment)
      }

      // 2. Direct authentication for static Firebase Hosting deployment
      if (!serverHandled) {
        if (
          (cleanUser.toLowerCase() === 'admin' && password === 'Admin123') ||
          (cleanUser.toLowerCase() === 'officer' && password === 'EcoWatch2026')
        ) {
          onLoginSuccess();
          return;
        } else {
          setError('Invalid username or password. Default credentials: Admin / Admin123');
        }
      }
    } catch {
      setError('Unable to authenticate. Default credentials: Admin / Admin123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-screen" className="w-full max-w-md mx-auto py-12 sm:py-16 px-4">
      <button
        id="btn-back-from-admin-login"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736A] hover:text-[#174A35] mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-8 sm:p-10 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight uppercase">
            ADMIN PORTAL
          </h1>
          <p className="text-xs sm:text-sm text-[#65736A]">
            Manage environmental reports and coordinate action.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-[#B64242]/30 bg-[#B64242]/5 flex items-center gap-2 text-xs font-semibold text-[#B64242] text-left">
            <AlertCircle className="w-4 h-4 text-[#B64242] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left pt-1">
          <div>
            <label htmlFor="admin-username-input" className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all font-medium shadow-2xs"
                required
              />
              <User className="w-4 h-4 text-[#65736A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password-input" className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/50 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all font-medium shadow-2xs"
                required
              />
              <Lock className="w-4 h-4 text-[#65736A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            id="btn-admin-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#174A35] hover:bg-[#236448] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-xs hover:shadow transition-all cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-[#DCE5DE] flex items-center justify-center gap-1.5 text-xs text-[#65736A] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />
          <span>Authorized institute access only</span>
        </div>
      </div>
    </div>
  );
}
