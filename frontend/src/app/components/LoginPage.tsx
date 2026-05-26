import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { Waves, Mail, Lock, AlertCircle, Loader2, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_ACCOUNTS = [
  {
    label: 'Customer',
    email: 'customer@example.com',
    password: 'password123',
    icon: User,
    desc: 'Place orders, track laundry & schedule pickups',
    color: 'border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Admin',
    email: 'admin@laundry.com',
    password: 'admin123',
    icon: ShieldCheck,
    desc: 'Manage orders, schedules & users',
    color: 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-700',
    iconBg: 'bg-amber-100 text-amber-600',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      toast.success('Login successful!');
      const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (savedUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.message || 'Incorrect email or password.');
      toast.error(result.message || 'Incorrect email or password.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || quickLoading) return;
    setLoading(true);
    await doLogin(email, password);
    setLoading(false);
  };

  const handleQuickLogin = async (account: typeof QUICK_ACCOUNTS[0]) => {
    if (loading || quickLoading) return;
    setQuickLoading(account.label);
    setEmail(account.email);
    setPassword(account.password);
    await doLogin(account.email, account.password);
    setQuickLoading(null);
  };

  const isAnyLoading = loading || !!quickLoading;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl">
            <Waves className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg text-foreground">Mr. Laba-Laba</span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to continue</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* ── Quick Login Role Switcher ── */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-card text-xs text-muted-foreground">
                Quick login as
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACCOUNTS.map((acct) => {
              const Icon = acct.icon;
              const isThis = quickLoading === acct.label;
              return (
                <button
                  key={acct.label}
                  type="button"
                  disabled={isAnyLoading}
                  onClick={() => handleQuickLogin(acct)}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${acct.color}`}
                >
                  <div className={`p-2 rounded-lg ${acct.iconBg}`}>
                    {isThis ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">{acct.label}</span>
                  <span className="text-[10px] leading-tight text-center opacity-80">
                    {acct.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Create Account ── */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-card text-xs text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link
            to="/signup"
            className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
