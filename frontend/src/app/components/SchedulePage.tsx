import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Truck, Package, HelpCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';

const BOOKING_STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending' },
  accepted: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Confirmed' },
  rejected: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' },
};

const InfoTip = ({ text }: { text: string }) => (
  <span className="group relative inline-flex items-center ml-1">
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
    <span className="invisible group-hover:visible absolute bottom-5 left-1/2 -translate-x-1/2 z-50 w-56 rounded-xl bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-xl text-center">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
    </span>
  </span>
);

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

export default function SchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceType, setServiceType] = useState('pickup');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    loadUserBookings();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      loadSlotAvailability();
    } else {
      setSlotCounts({});
    }
  }, [selectedDate]);

  const loadUserBookings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setUserBookings(data.data);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  const loadSlotAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php?action=slots_for_date&date=${selectedDate}`);
      const data = await response.json();
      if (data.success) {
        setSlotCounts(data.data);
      }
    } catch (err) {
      console.error('Error loading slot availability:', err);
    }
  };

  const getBookedCount = (time: string) => {
    return slotCounts[time] || 0;
  };

  const isSlotFull = (time: string) => {
    if (!selectedDate) return false;
    return getBookedCount(time) >= 3;
  };

  const getSlotAvailability = (time: string) => {
    if (!selectedDate) return null;
    const count = getBookedCount(time);
    return Math.max(0, 3 - count);
  };

  const handleBookingClick = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceLabel = serviceType === 'pickup' ? 'Pickup' : 'Drop-off';
    const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Schedule Booking',
      message: `Are you sure you want to request a ${serviceLabel} appointment on ${dateLabel} at ${selectedTime}?`,
      onConfirm: () => executeBookingSubmit()
    });
  };

  const executeBookingSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          serviceType,
          userId: user?.id || 'guest',
          userName: user?.name || 'Guest',
          userEmail: user?.email || ''
        })
      });
      const data = await response.json();
      if (data.success) {
        await loadUserBookings();
        setShowSuccess(true);
        toast.success('Schedule request submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to book appointment.');
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      toast.error('Failed to connect to the backend server. Please check if PHP is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSelectedDate('');
    setSelectedTime('');
    setServiceType('pickup');
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Schedule Appointment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Book a pickup or drop-off time. Subject to admin confirmation.
          </p>
        </div>

        <form onSubmit={handleBookingClick} className="space-y-5">
          {/* Step 1: Service type */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Step 1 · Service
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setServiceType('pickup')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  serviceType === 'pickup'
                    ? 'border-primary bg-secondary'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                <Truck className={`w-5 h-5 shrink-0 ${serviceType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm font-medium ${serviceType === 'pickup' ? 'text-primary' : 'text-foreground'}`}>
                    Pickup
                  </p>
                  <p className="text-xs text-muted-foreground">We collect from you</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setServiceType('dropoff')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  serviceType === 'dropoff'
                    ? 'border-primary bg-secondary'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                <Package className={`w-5 h-5 shrink-0 ${serviceType === 'dropoff' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm font-medium ${serviceType === 'dropoff' ? 'text-primary' : 'text-foreground'}`}>
                    Drop-off
                  </p>
                  <p className="text-xs text-muted-foreground">You bring to us</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Date */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Step 2 · Date
            </p>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available up to 30 days in advance · Mon–Sat only
            </p>
          </div>

          {/* Step 3: Time slot */}
          {selectedDate && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Step 3 · Time slot
                </p>
                <InfoTip text="Each slot holds max 3 bookings. Slots marked 'Full' are unavailable for this date." />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const full = isSlotFull(time);
                  const available = getSlotAvailability(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={full}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm transition-all ${
                        selectedTime === time
                          ? 'border-primary bg-secondary text-primary font-medium'
                          : full
                          ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{time}</span>
                      </div>
                      {full ? (
                        <p className="text-xs text-red-400 mt-0.5">Full</p>
                      ) : available !== null && available <= 1 ? (
                        <p className="text-xs text-amber-500 mt-0.5">Last slot</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Book appointment'
            )}
          </button>
        </form>

        {/* My Scheduled Appointments */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mt-6">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              My Scheduled Appointments
            </h2>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-10 px-5 text-sm text-muted-foreground">
              No scheduled appointments yet. Use the form above to book one!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {userBookings.map((booking, i) => {
                const st = booking.status || 'pending';
                const stCfg = BOOKING_STATUS_CONFIG[st] || BOOKING_STATUS_CONFIG.pending;
                return (
                  <div key={i} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${stCfg.bg}`}>
                        <CalendarIcon className={`w-4 h-4 ${stCfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {booking.serviceType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {booking.time}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stCfg.bg} ${stCfg.color} border ${stCfg.border}`}>
                        {stCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-7 max-w-sm w-full shadow-2xl border border-border">
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Request sent!</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Your booking is pending admin confirmation. You can check its status in My Dashboard.
              </p>
              <div className="bg-secondary rounded-xl p-4 mb-5 text-sm text-left space-y-1">
                <p className="font-semibold text-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
                <p className="text-primary font-medium">{selectedTime}</p>
                <p className="text-muted-foreground capitalize">{serviceType}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
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
