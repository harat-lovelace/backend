import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';
import {
  Package, Calendar, Bell, Clock, CheckCircle2, Droplets, Wind,
  FoldVertical, Plus, X, ArrowRight, Search, User, Loader2, Key
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof Package; desc: string }> = {
  'Order Submitted': {
    color: 'text-blue-700', bg: 'bg-blue-50',
    icon: Package, desc: 'Your order has been received and is queued for processing.'
  },
  'Order Accepted': {
    color: 'text-sky-700', bg: 'bg-sky-50',
    icon: CheckCircle2, desc: 'Your order has been accepted and scheduled for processing.'
  },
  'Pickup Scheduled': {
    color: 'text-indigo-700', bg: 'bg-indigo-50',
    icon: Calendar, desc: 'Rider scheduled to pick up your laundry.'
  },
  'Laundry Picked Up': {
    color: 'text-purple-700', bg: 'bg-purple-50',
    icon: Package, desc: 'Your laundry has been picked up.'
  },
  'Washing': {
    color: 'text-violet-700', bg: 'bg-violet-50',
    icon: Droplets, desc: 'Your laundry is currently being washed.'
  },
  'Drying': {
    color: 'text-amber-700', bg: 'bg-amber-50',
    icon: Wind, desc: 'Freshly washed and now drying.'
  },
  'Folding': {
    color: 'text-orange-700', bg: 'bg-orange-50',
    icon: FoldVertical, desc: 'Almost done — being folded and packed neatly.'
  },
  'Ready for Delivery': {
    color: 'text-emerald-700', bg: 'bg-emerald-50',
    icon: CheckCircle2, desc: 'Ready! Come pick it up or watch for our rider.'
  },
  'Completed': {
    color: 'text-green-700', bg: 'bg-green-50',
    icon: CheckCircle2, desc: 'Thank you for choosing us! Laundry process is complete.'
  },
};

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
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
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ordersResponse = await fetch(`${API_BASE_URL}/orders.php?userId=${user.id}`);
      const ordersData = await ordersResponse.json();
      
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings.php?userId=${user.id}`);
      const bookingsData = await bookingsResponse.json();

      const notificationsResponse = await fetch(`${API_BASE_URL}/notifications.php?email=${user.email}`);
      const notificationsData = await notificationsResponse.json();
      
      if (ordersData.success && bookingsData.success) {
        setOrders(ordersData.data);
        setBookings(bookingsData.data);
      }
      if (notificationsData.success) {
        setNotifications(notificationsData.data.filter((n: any) => !n.isRead));
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationId: id })
      });
      const result = await response.json();
      if (result.success) {
        loadCustomerData();
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
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
        toast.success('Profile updated successfully!');
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

  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  if (loading && orders.length === 0 && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded-lg w-1/4" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 h-44 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Hello, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeOrders.length > 0
                ? `${activeOrders.length} active laundry order${activeOrders.length > 1 ? 's' : ''}`
                : 'All clear! No active laundry orders'}
            </p>
          </div>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New order
          </Link>
        </div>

        {/* Notifications — shown only when relevant */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-3 duration-200"
              >
                <div className="bg-primary text-white p-2 rounded-lg shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900">New update</p>
                  <p className="text-sm text-blue-800 mt-0.5">
                    {notif.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-blue-600 hover:text-blue-900 transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Orders', value: activeOrders.length, color: 'text-primary' },
            { label: 'Completed Orders', value: completedOrders.length, color: 'text-green-600' },
            { label: 'Schedules', value: bookings.length, color: 'text-violet-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions Navigation Cards */}
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <Link
            to="/order"
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                New Order
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Place a new laundry request in seconds.</p>
            </div>
          </Link>

          <Link
            to="/schedule"
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="bg-violet-50 text-violet-600 p-3 rounded-xl w-fit group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                Book &amp; View Schedules
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Schedule a pickup or drop-off time slot and view historical bookings.</p>
            </div>
          </Link>

          <Link
            to="/track"
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                Track Order Status
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Check laundry progress by searching with your customer name.</p>
            </div>
          </Link>
        </div>

        {/* Profile Settings Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Account Settings</h2>
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
