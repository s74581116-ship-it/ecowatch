import { useState } from 'react';
import { User, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

interface PublicLoginViewProps {
  onContinue: (name: string) => void;
  onBack: () => void;
  initialName?: string;
}

export default function PublicLoginView({ onContinue, onBack, initialName = '' }: PublicLoginViewProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must contain at least 2 characters.');
      return;
    }
    setError(null);
    onContinue(trimmed);
  };

  return (
    <div id="public-entry-screen" className="w-full max-w-md mx-auto py-12 sm:py-16 px-4">
      <button
        id="btn-back-to-landing"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736A] hover:text-[#174A35] mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="bg-white rounded-2xl border border-[#DCE5DE] p-8 sm:p-10 shadow-sm text-center space-y-6">
        {/* Environmental Logo */}
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight">
            Welcome to EcoWatch
          </h1>
          <p className="text-sm text-[#65736A] font-medium">
            Let's start with your name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left pt-2">
          <div>
            <label htmlFor="public-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-2">
              Your Name
            </label>
            <div className="relative">
              <input
                id="public-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Sharon Manoj"
                autoFocus
                className="w-full pl-10 pr-4 py-3.5 text-sm bg-white border border-[#DCE5DE] rounded-xl text-[#17201B] placeholder-[#65736A]/60 focus:border-[#174A35] focus:ring-2 focus:ring-[#65B86E]/20 focus:outline-none transition-all shadow-2xs font-medium"
              />
              <User className="w-4 h-4 text-[#65736A] absolute left-3.5 top-4" />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B64242] mt-2 p-2.5 rounded-lg bg-[#B64242]/5 border border-[#B64242]/20">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B64242]" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            id="btn-public-continue"
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#174A35] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#236448] shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Informative reassurance tag */}
        <div className="pt-2 border-t border-[#DCE5DE]/60 flex items-center justify-center gap-1.5 text-xs text-[#2F7D4A] font-semibold bg-[#EAF4EC]/50 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />
          <span>No account required.</span>
        </div>
      </div>
    </div>
  );
}
