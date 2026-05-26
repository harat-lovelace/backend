import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Users, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: 'bg-background', border: 'border-border', color: 'text-amber-600', label: 'Pending' },
  accepted: { bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-700', label: 'Confirmed' },
  rejected: { bg: 'bg-red-50', border: 'border-red-200', color: 'text-red-700', label: 'Rejected' },
};

export default function AdminScheduleManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        toast.error(data.message || 'Failed to load bookings.');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      toast.error('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: 'accepted' | 'rejected') => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', bookingId, status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Booking status updated to ${status === 'accepted' ? 'confirmed' : 'rejected'}.`);
        loadBookings();
      } else {
        toast.error(data.message || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error('Failed to communicate with database.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusClick = (bookingId: number, newStatus: 'accepted' | 'rejected') => {
    const actionLabel = newStatus === 'accepted' ? 'confirm' : 'reject';
    setConfirmModal({
      isOpen: true,
      title: `${newStatus === 'accepted' ? 'Confirm' : 'Reject'} Booking`,
      message: `Are you sure you want to ${actionLabel} this booking? This will update the status in the database and log a notification.`,
      onConfirm: () => updateBookingStatus(bookingId, newStatus)
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      !searchTerm ||
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || booking.date === filterDate;
    const matchesStatus = filterStatus === 'all' || (booking.status || 'pending') === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const groupedByDate = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedByDate).sort();
  const pendingCount = bookings.filter(b => (b.status || 'pending') === 'pending').length;

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
          <div className="h-8 bg-muted rounded-lg w-1/4" />
          <div className="h-10 bg-muted rounded-xl w-full" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded-xl" />
            <div className="h-28 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Schedule Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors text-foreground"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
          {(filterDate || filterStatus !== 'all' || searchTerm) && (
            <button
              onClick={() => { setFilterDate(''); setFilterStatus('all'); setSearchTerm(''); }}
              className="px-3.5 py-2.5 bg-muted text-foreground rounded-xl text-sm hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: bookings.length, color: 'text-primary' },
            { label: 'Pickup', value: bookings.filter(b => b.serviceType === 'pickup').length, color: 'text-violet-600' },
            { label: 'Drop-off', value: bookings.filter(b => b.serviceType === 'dropoff').length, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3.5 text-center shadow-sm">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Schedule by date */}
        {sortedDates.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-14 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No bookings match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dayBookings = groupedByDate[date];
              const dayPending = dayBookings.filter(b => (b.status || 'pending') === 'pending').length;
              return (
                <div key={date} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3.5 bg-muted/40 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                      {dayPending > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          {dayPending} pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {dayBookings
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((booking, localIdx) => {
                        const status = booking.status || 'pending';
                        const cfg = STATUS_CFG[status] || STATUS_CFG.pending;

                        return (
                          <div
                            key={localIdx}
                            className={`px-5 py-4 flex items-center justify-between gap-4 ${cfg.bg} transition-colors`}
                          >
                            {/* Left: customer info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`px-2.5 py-1.5 rounded-lg bg-card border ${cfg.border} shrink-0`}>
                                <p className="font-bold text-sm text-foreground font-mono">{booking.time}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {booking.userName || 'Guest'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {booking.userEmail || 'No email'} · <span className="capitalize">{booking.serviceType}</span>
                                </p>
                              </div>
                            </div>

                            {/* Right: status + actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              {actionLoading === booking.id ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              ) : status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleStatusClick(booking.id, 'accepted')}
                                    className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusClick(booking.id, 'rejected')}
                                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-foreground">{confirmModal.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 bg-muted text-foreground py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
