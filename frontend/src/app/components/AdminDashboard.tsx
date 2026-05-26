import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from './AuthContext';
import { Package, Clock, CheckCircle2, Calendar, Users, ArrowRight, AlertCircle, User, Key, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';

const STATUS_COLOR: Record<string, string> = {
  'Order Submitted': 'bg-blue-50 text-blue-700',
  'Order Accepted': 'bg-sky-50 text-sky-700',
  'Pickup Scheduled': 'bg-indigo-50 text-indigo-700',
  'Laundry Picked Up': 'bg-purple-50 text-purple-700',
  'Washing': 'bg-violet-50 text-violet-700',
  'Drying': 'bg-amber-50 text-amber-700',
  'Folding': 'bg-orange-50 text-orange-700',
  'Ready for Delivery': 'bg-emerald-50 text-emerald-700',
  'Completed': 'bg-green-50 text-green-700',
};

export default function AdminDashboard() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Profile fields state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordersRes = await fetch(`${API_BASE_URL}/orders.php`);
      const ordersData = await ordersRes.json();
      
      const bookingsRes = await fetch(`${API_BASE_URL}/bookings.php`);
      const bookingsData = await bookingsRes.json();
      
      const statsRes = await fetch(`${API_BASE_URL}/admin_stats.php`);
      const statsData = await statsRes.json();
      
      if (ordersData.success && bookingsData.success && statsData.success) {
        setOrders(ordersData.data);
        setBookings(bookingsData.data);
        setCustomers(new Array(statsData.data.customersCount).fill({}));
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileLoading) return;
    setProfileLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          password: profilePassword
        })
      });
      const result = await response.json();
      if (result.success) {
        updateUser(result.data);
        setProfilePassword('');
        toast.success('Admin profile updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('Unable to update profile. Connection error.');
    } finally {
      setProfileLoading(false);
    }
  };

  const totalOrders = orders.length;
  const inProgress = orders.filter(o => !['Completed'].includes(o.status)).length;
  const readyForPickup = orders.filter(o => o.status === 'Ready for Delivery').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  if (loading && orders.length === 0 && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded-lg w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="h-40 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mr. Laba-Laba Laundry Services</p>
        </div>

        {/* Pending bookings alert */}
        {pendingBookings > 0 && (
          <Link
            to="/admin/schedule"
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 hover:bg-amber-100 transition-colors shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {pendingBookings} pending booking{pendingBookings > 1 ? 's' : ''} need your review
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Tap to manage schedules</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 animate-bounce-x" />
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total orders', value: totalOrders, icon: Package, color: 'text-primary', bg: 'bg-secondary' },
            { label: 'In progress', value: inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Ready for delivery', value: readyForPickup, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Customers count', value: customers.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/admin/orders"
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group flex items-center gap-4"
          >
            <div className="bg-secondary text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Manage Orders</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalOrders} total · {inProgress} active
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link
            to="/admin/schedule"
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group flex items-center gap-4"
          >
            <div className="bg-violet-50 text-violet-600 p-3 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Manage Schedules</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bookings.length} total · {pendingBookings} pending
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </div>

        {/* Recent orders */}
        {orders.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {orders.slice(-5).reverse().map((order) => (
                <div key={order.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-semibold text-primary shrink-0">{order.id}</span>
                    <span className="text-sm text-foreground truncate">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{order.weight} kg</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[order.status] || 'bg-muted text-muted-foreground'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Settings Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Admin Settings</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={profileLoading}
                  className="w-full px-3.5 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  disabled={profileLoading}
                  className="w-full px-3.5 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground disabled:opacity-70"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-muted-foreground" />
                Change Password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                disabled={profileLoading}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground disabled:opacity-70"
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-75"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
