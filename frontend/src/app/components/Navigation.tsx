import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import {
  Waves,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Bell
} from 'lucide-react';
import logoImg from '../../assets/laundry_logo.png';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications.php?email=${user.email}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read', email: user.email })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('All notifications marked as read.');
        loadNotifications();
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully. See you again!');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path.startsWith('#')) {
      return location.hash === path;
    }
    return location.pathname === path && !location.hash;
  };

  const navLinkClass = (path: string) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-50 text-blue-600 font-semibold'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  const customerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/order', label: 'New Order' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/track', label: 'Track Order' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/schedule', label: 'Schedules' },
  ];

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '#about', label: 'About Us', isAnchor: true },
    { to: '#services', label: 'Services', isAnchor: true },
    { to: '#faq', label: 'FAQ', isAnchor: true },
    { to: '#blog', label: 'Blog', isAnchor: true },
  ];

  const links = isAuthenticated
    ? (user?.role === 'admin' ? adminLinks : customerLinks)
    : publicLinks;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, isAnchor?: boolean) => {
    if (isAnchor) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(to.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', to);
        }
      } else {
        // If not on homepage, navigate to homepage with hash
        e.preventDefault();
        navigate('/' + to);
      }
    }
    setMobileOpen(false);
  };

  return (
    <header className="w-full z-50">
      {/* Top Info Bar (Desktop only) */}
      <div className="hidden lg:block bg-blue-600 text-white py-2 px-4 border-b border-blue-500/25">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <Waves className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Mr. Laba-Laba Laundry Service</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>Open Daily: Mon–Sat, 8:00 AM – 8:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cogon, Balingasag, Misamis Oriental</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-yellow-300" />
              <span className="font-semibold">+63 912 345 6789</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src={logoImg}
                className="w-10 h-10 rounded-full object-cover border border-slate-200/50 shadow-sm"
                alt="Mr. Laba-Laba Logo"
              />
              <span className="font-bold text-foreground text-base tracking-tight lg:hidden xl:block">
                Mr. Laba-Laba
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isAnchor = 'isAnchor' in link ? link.isAnchor : false;
                return isAnchor ? (
                  <a
                    key={link.to}
                    href={link.to}
                    onClick={(e) => handleAnchorClick(e, link.to, true)}
                    className={navLinkClass(link.to)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={navLinkClass(link.to)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right-side CTAs */}
            <div className="flex items-center gap-3">
              {/* Social icons (Desktop) */}
              {!isAuthenticated && (
                <div className="hidden lg:flex items-center gap-3 text-muted-foreground mr-2 border-r border-border pr-4">
                  <a href="#" className="hover:text-blue-600 transition-colors p-1" title="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="hover:text-sky-500 transition-colors p-1" title="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="hover:text-pink-600 transition-colors p-1" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {/* Notification Bell Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setBellOpen(!bellOpen)}
                      className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                          {notifications.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </button>

                    {bellOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
                          <span className="text-sm font-semibold text-foreground">Notifications</span>
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <button
                              onClick={() => {
                                markAllAsRead();
                                setBellOpen(false);
                              }}
                              className="text-xs text-primary hover:underline font-medium cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-border">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`px-4 py-2.5 text-left transition-colors ${
                                  notif.isRead ? 'opacity-70 bg-card' : 'bg-blue-50/45 font-medium'
                                }`}
                              >
                                <p className="text-xs text-foreground leading-relaxed">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg border border-border">
                    {user?.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate max-w-28">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4.5 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors shadow-md shadow-yellow-100 flex items-center gap-1.5"
                  >
                    Schedule Today
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              {isAuthenticated && (
                <button
                  className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              {!isAuthenticated && (
                <button
                  className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
            {links.map((link) => {
              const isAnchor = 'isAnchor' in link ? link.isAnchor : false;
              const linkStyle = `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`;
              return isAnchor ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.to, true)}
                  className={linkStyle}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={linkStyle}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">{user?.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-border mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg"
                >
                  Schedule Today
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

