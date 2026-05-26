import { useState, useEffect } from 'react';
import { Plus, Search, ArrowRight, HelpCircle, Trash2, XCircle, Loader2, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { toast } from 'sonner';

const InfoTip = ({ text }: { text: string }) => (
  <span className="group relative inline-flex items-center ml-1">
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
    <span className="invisible group-hover:visible absolute bottom-5 left-1/2 -translate-x-1/2 z-50 w-56 rounded-xl bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-xl text-center">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
    </span>
  </span>
);

const STATUS_ORDER = [
  'Order Submitted',
  'Order Accepted',
  'Pickup Scheduled',
  'Laundry Picked Up',
  'Washing',
  'Drying',
  'Folding',
  'Ready for Delivery',
  'Completed'
];

const STATUS_COLOR: Record<string, string> = {
  'Order Submitted': 'bg-blue-50 text-blue-700 border-blue-100',
  'Order Accepted': 'bg-sky-50 text-sky-700 border-sky-100',
  'Pickup Scheduled': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Laundry Picked Up': 'bg-purple-50 text-purple-700 border-purple-100',
  'Washing': 'bg-violet-50 text-violet-700 border-violet-100',
  'Drying': 'bg-amber-50 text-amber-700 border-amber-100',
  'Folding': 'bg-orange-50 text-orange-700 border-orange-100',
  'Ready for Delivery': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Completed': 'bg-green-50 text-green-700 border-green-100',
};

const NEXT_STATUS: Record<string, string | null> = {
  'Order Submitted': 'Order Accepted',
  'Order Accepted': 'Pickup Scheduled',
  'Pickup Scheduled': 'Laundry Picked Up',
  'Laundry Picked Up': 'Washing',
  'Washing': 'Drying',
  'Drying': 'Folding',
  'Folding': 'Ready for Delivery',
  'Ready for Delivery': 'Completed',
  'Completed': null,
};

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    contactNumber: '',
    laundryType: 'wash-fold',
    weight: '',
    specialInstructions: '',
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders.php`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error(data.message || 'Failed to load orders.');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('customerName', newOrder.customerName);
      dataPayload.append('contactNumber', newOrder.contactNumber);
      dataPayload.append('laundryType', newOrder.laundryType);
      dataPayload.append('weight', newOrder.weight);
      dataPayload.append('specialInstructions', newOrder.specialInstructions);
      dataPayload.append('userId', 'admin-created');
      dataPayload.append('userEmail', 'admin-created');

      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        body: dataPayload
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Order created successfully!');
        setNewOrder({ customerName: '', contactNumber: '', laundryType: 'wash-fold', weight: '', specialInstructions: '' });
        setShowCreateOrder(false);
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to create order.');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error('Connection error.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // If setting to Completed, require confirmation dialog
    if (newStatus === 'Completed') {
      setConfirmModal({
        isOpen: true,
        title: 'Mark Order as Completed',
        message: `Are you sure you want to mark order ${orderId} as Completed? This action is permanent.`,
        onConfirm: () => executeUpdateStatus(orderId, newStatus)
      });
    } else {
      executeUpdateStatus(orderId, newStatus);
    }
  };

  const executeUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}.`);
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Connection failure.');
    } finally {
      setActionLoading(null);
    }
  };

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;

    if (next === 'Completed') {
      setConfirmModal({
        isOpen: true,
        title: 'Mark Order as Completed',
        message: `Are you sure you want to advance order ${orderId} to Completed? This will finish the laundry process.`,
        onConfirm: () => executeAdvanceStatus(orderId)
      });
    } else {
      executeAdvanceStatus(orderId);
    }
  };

  const executeAdvanceStatus = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', orderId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order advanced to ${data.data?.nextStatus || 'next status'}.`);
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to advance order status.');
      }
    } catch (err) {
      console.error('Error advancing status:', err);
      toast.error('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrderClick = (orderId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order Record',
      message: `Are you sure you want to permanently delete completed order ${orderId}? This action cannot be undone.`,
      onConfirm: () => executeDeleteOrder(orderId)
    });
  };

  const executeDeleteOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', orderId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order ${orderId} deleted successfully.`);
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to delete order.');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrderClick = (orderId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Order',
      message: `Are you sure you want to cancel active order ${orderId}? This action cannot be undone.`,
      onConfirm: () => executeCancelOrder(orderId)
    });
  };

  const executeCancelOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', orderId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order ${orderId} cancelled successfully.`);
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Order Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => setShowCreateOrder(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create order
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>

        {/* Loading Skeleton */}
        {loading && orders.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-xl w-full" />
            <div className="h-64 bg-muted rounded-2xl w-full" />
          </div>
        ) : (
          /* Orders table */
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Order ID
                      <InfoTip text="IDs are formatted as LDY-XXXX and are auto-generated when an order is created." />
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Service</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Weight</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Advance
                      <InfoTip text="Click '→ Next' to move the order to the next stage. Or use the dropdown to set any status." />
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Est. Pickup</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 text-sm text-muted-foreground">
                        {searchTerm ? 'No orders match your search.' : 'No orders found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const next = NEXT_STATUS[order.status];
                      const isActioning = actionLoading === order.id;
                      return (
                        <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-semibold text-primary">{order.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.contactNumber}</p>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell text-foreground capitalize">
                            {order.laundryType.replace('-', ' ')}
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell text-foreground">
                            {order.weight} kg
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[order.status] || 'bg-muted text-muted-foreground'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {isActioning ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              ) : (
                                <>
                                  {/* One-click advance — efficiency shortcut */}
                                  {next && (
                                    <button
                                      onClick={() => advanceStatus(order.id, order.status)}
                                      title={`Advance to ${next}`}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium shrink-0"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                      {next}
                                    </button>
                                  )}
                                  {/* Dropdown for setting any status */}
                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="px-2.5 py-1.5 bg-input-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                                    title="Set any status"
                                  >
                                    {STATUS_ORDER.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {isActioning ? (
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            ) : order.status === 'Completed' ? (
                              <button
                                onClick={() => handleDeleteOrderClick(order.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-lg text-xs font-semibold transition-colors shrink-0"
                                title="Delete completed order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCancelOrderClick(order.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-100 rounded-lg text-xs font-semibold transition-colors shrink-0"
                                title="Cancel active order"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">
                            {order.estimatedPickup}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card rounded-2xl border border-border p-7 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-foreground mb-5">Create Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Customer name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contact number</label>
                <input
                  type="tel"
                  required
                  value={newOrder.contactNumber}
                  onChange={(e) => setNewOrder({ ...newOrder, contactNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Service type</label>
                <select
                  value={newOrder.laundryType}
                  onChange={(e) => setNewOrder({ ...newOrder, laundryType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="wash-fold">Wash & Fold</option>
                  <option value="dry-clean">Dry Clean</option>
                  <option value="express">Express Service</option>
                  <option value="delicate">Delicate Items</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={newOrder.weight}
                  onChange={(e) => setNewOrder({ ...newOrder, weight: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  placeholder="e.g. 4.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Special instructions <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={newOrder.specialInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-foreground"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create order'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateOrder(false)}
                  className="flex-1 bg-muted text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
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
