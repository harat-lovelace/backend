import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router';
import { Search, Package, Droplets, Wind, FoldVertical, CheckCircle2, HelpCircle, ArrowRight, Calendar, Truck } from 'lucide-react';
import { apiGet } from '../services/api';

const InfoTip = ({ text }: { text: string }) => (
  <span className="group relative inline-flex items-center ml-1">
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
    <span className="invisible group-hover:visible absolute bottom-5 left-1/2 -translate-x-1/2 z-50 w-56 rounded-xl bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-xl text-center">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
    </span>
  </span>
);

const STATUSES = [
  'Order Submitted',
  'Order Accepted',
  'Pickup Scheduled',
  'Laundry Picked Up',
  'Washing',
  'Drying',
  'Folding',
  'Ready for Delivery',
  'Completed'
] as const;

const STATUS_META: Record<string, { icon: typeof Package; desc: string; color: string }> = {
  'Order Submitted': {
    icon: Package,
    desc: 'Order received and queued for processing.',
    color: 'text-blue-600',
  },
  'Order Accepted': {
    icon: CheckCircle2,
    desc: 'Order has been accepted by the branch.',
    color: 'text-sky-600',
  },
  'Pickup Scheduled': {
    icon: Calendar,
    desc: 'Pickup rider has been scheduled.',
    color: 'text-indigo-600',
  },
  'Laundry Picked Up': {
    icon: Truck,
    desc: 'Laundry picked up and on the way to our facility.',
    color: 'text-violet-600',
  },
  'Washing': {
    icon: Droplets,
    desc: "Your clothes are in the washing machine.",
    color: 'text-blue-600',
  },
  'Drying': {
    icon: Wind,
    desc: 'Washing complete. Now drying.',
    color: 'text-amber-600',
  },
  'Folding': {
    icon: FoldVertical,
    desc: 'Dry and being folded neatly.',
    color: 'text-orange-600',
  },
  'Ready for Delivery': {
    icon: Truck,
    desc: 'Packed and ready for delivery/pickup.',
    color: 'text-emerald-600',
  },
  'Completed': {
    icon: CheckCircle2,
    desc: 'Laundry has been completed and delivered.',
    color: 'text-green-600',
  },
};

export default function TrackingPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchName, setSearchName] = useState('');
  const [matchingOrders, setMatchingOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchName.trim().toLowerCase();
    if (!query) return;

    try {
      const searchUrl = user?.role === 'customer' 
        ? `/orders?search=${encodeURIComponent(query)}&userId=${user.id}` 
        : `/orders?search=${encodeURIComponent(query)}`;
        
      const data = await apiGet(searchUrl);
      
      if (data.success && data.data.length > 0) {
        setMatchingOrders(data.data);
        if (data.data.length === 1) {
          setSelectedOrder(data.data[0]);
        } else {
          setSelectedOrder(null);
        }
        setNotFound(false);
      } else {
        setMatchingOrders([]);
        setSelectedOrder(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error('Tracking search error:', err);
      alert('Failed to connect to the backend server.');
    }
  };

  const currentIndex = selectedOrder ? STATUSES.indexOf(selectedOrder.status) : -1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Track Order by Name</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter your customer name to search and check laundry progress.
          </p>
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                required
                autoFocus
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                placeholder="Enter Customer Name (e.g. John Doe)"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
            >
              Search
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2.5 flex items-center">
            Tracks orders by searching for the name you inputted during order placement
            <InfoTip text="Input your full name to fetch order status logs." />
          </p>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-red-700">Order not found.</p>
            <p className="text-xs text-red-500 mt-1">
              {user?.role === 'customer'
                ? 'Check your Order ID and make sure it belongs to your account.'
                : 'Check the Order ID and try again.'}
            </p>
          </div>
        )}

        {/* Matching Orders List (if multiple matches and none selected) */}
        {matchingOrders.length > 1 && !selectedOrder && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2.5">
              Select an order matching "{searchName}"
            </h2>
            <div className="divide-y divide-border">
              {matchingOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full text-left py-3 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 first:pt-0 last:pb-0 group"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-primary flex items-center gap-1.5">
                      {order.id}
                      <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-sans font-medium capitalize">
                        {order.laundryType.replace('-', ' ')}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weight: {order.weight} kg · Created {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {order.status}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Est. Pickup: {order.estimatedPickup}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Order Details & Timeline */}
        {selectedOrder && (
          <div className="space-y-4">
            {/* Back button (only shown if there are multiple matches) */}
            {matchingOrders.length > 1 && (
              <button
                onClick={() => setSelectedOrder(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                &larr; Back to matching orders
              </button>
            )}

            {/* Order meta */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order</p>
                  <p className="font-mono text-lg font-bold text-primary">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Est. pickup</p>
                  <p className="text-sm font-medium text-foreground">{selectedOrder.estimatedPickup}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
                  <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Service</p>
                  <p className="font-medium text-foreground capitalize">
                    {selectedOrder.laundryType.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
                  <p className="font-medium text-foreground">{selectedOrder.weight} kg</p>
                </div>
              </div>
            </div>

            {/* Status timeline — vertical, with descriptions */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-5">Progress</h2>
              <div className="space-y-0">
                {STATUSES.map((status, i) => {
                  const meta = STATUS_META[status];
                  const Icon = meta.icon;
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const isLast = i === STATUSES.length - 1;

                  return (
                    <div key={status} className="flex gap-4">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isDone
                              ? isCurrent
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                : 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 my-1 min-h-6 ${isDone && i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-5 ${isLast ? 'pb-0' : ''} pt-1 min-w-0`}>
                        <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {status}
                        </p>
                        <p className={`text-xs mt-0.5 leading-relaxed ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isCurrent ? meta.desc : isDone ? 'Complete' : 'Waiting'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
