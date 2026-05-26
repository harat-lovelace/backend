import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { Waves, Mail, Lock, User, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated, user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password, role);
    setLoading(false);
    if (result.success) {
      toast.success('Registration successful! Welcome to Mr. Laba-Laba.');
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.message || 'An account with this email already exists.');
      toast.error(result.message || 'An account with this email already exists.');
    }
  };

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
          <h1 className="text-xl font-semibold text-foreground mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join for convenient laundry service</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Role Selector ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                I am signing up as
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    role === 'customer'
                      ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-border hover:border-blue-200 hover:bg-blue-50/40 text-muted-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${role === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold">Customer</span>
                  <span className="text-[10px] leading-tight text-center opacity-75">Place & track orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-border hover:border-amber-200 hover:bg-amber-50/40 text-muted-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold">Admin</span>
                  <span className="text-[10px] leading-tight text-center opacity-75">Manage the system</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="Juan dela Cruz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="email"
                  required
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
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Create ${role === 'admin' ? 'Admin' : 'Customer'} account`
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-card text-xs text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}

