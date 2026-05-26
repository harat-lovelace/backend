import { useState } from 'react';
import { useAuth } from './AuthContext';
import { CheckCircle2, Package, HelpCircle, Waves, Sparkles, Clock, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
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

const SERVICE_TYPES = [
  {
    id: 'wash-fold',
    label: 'Wash & Fold',
    desc: 'Washed, dried & folded',
    icon: Waves,
  },
  {
    id: 'dry-clean',
    label: 'Dry Clean',
    desc: 'For delicate fabrics',
    icon: Sparkles,
  },
  {
    id: 'express',
    label: 'Express',
    desc: 'Ready within 24 hours',
    icon: Clock,
  },
  {
    id: 'delicate',
    label: 'Delicate Items',
    desc: 'Gentle care & handling',
    icon: Star,
  },
];

export default function OrderPage() {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    contactNumber: '',
    laundryType: 'wash-fold',
    weight: '',
    specialInstructions: '',
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const generateOrderId = () => {
    const orderCount = parseInt(localStorage.getItem('orderCount') || '0') + 1;
    localStorage.setItem('orderCount', orderCount.toString());
    return `LDY-${orderCount.toString().padStart(4, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('customerName', formData.customerName);
      dataPayload.append('contactNumber', formData.contactNumber);
      dataPayload.append('laundryType', formData.laundryType);
      dataPayload.append('weight', formData.weight);
      dataPayload.append('specialInstructions', formData.specialInstructions);
      dataPayload.append('userId', user?.id || 'guest');
      dataPayload.append('userEmail', user?.email || '');
      if (imageFile) {
        dataPayload.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/orders.php`, {
        method: 'POST',
        body: dataPayload
      });
      const result = await response.json();
      
      if (result.success) {
        setOrderId(result.data.orderId);
        setShowSuccess(true);
        toast.success(`Order placed successfully! Order ID: ${result.data.orderId}`);
      } else {
        toast.error(result.message || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error('Failed to connect to the backend server. Please check if PHP is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as any);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setFormData({
      customerName: user?.name || '',
      contactNumber: '',
      laundryType: 'wash-fold',
      weight: '',
      specialInstructions: '',
    });
    setShowInstructions(false);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-secondary text-primary p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">New Order</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            We'll have it ready in about 3 days.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm"
        >
          {/* Service type — visual card selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Service type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, laundryType: id })}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    formData.laundryType === id
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${formData.laundryType === id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-medium ${formData.laundryType === id ? 'text-primary' : 'text-foreground'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="Your full name"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contact number
            </label>
            <input
              type="tel"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="09XX XXX XXXX"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 items-center flex">
              Weight (kg)
              <InfoTip text="Estimate: 1 t-shirt ≈ 0.2 kg · 1 pair of jeans ≈ 0.6 kg · Typical load: 3–6 kg" />
            </label>
            <input
              type="number"
              required
              min="0.5"
              step="0.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="e.g. 4.5"
            />
          </div>

          {/* Special instructions — collapsed by default to reduce noise */}
          <div>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {showInstructions ? '− ' : '+ '}
              Special instructions
              <span className="text-xs ml-1">(optional)</span>
            </button>
            {showInstructions && (
              <textarea
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="mt-2 w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                placeholder="Separate colors? Delicate cycle? Let us know."
                autoFocus
              />
            )}
          </div>

          {/* Garment Image Upload Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Garment care label or photo
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary hover:file:bg-blue-100 transition-all cursor-pointer bg-input-background border border-border p-2 rounded-xl"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing order...
                </>
              ) : (
                'Submit order'
              )}
            </button>
            {/* Efficiency shortcut hint — subtle, for expert users */}
            <p className="text-xs text-muted-foreground text-center mt-2 opacity-0 focus-within:opacity-100 transition-opacity">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Ctrl</kbd>
              {' + '}
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">Enter</kbd>
              {' '}to submit
            </p>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Order placed!</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Save your Order ID to track your laundry status.
              </p>
              <div className="bg-secondary rounded-xl p-4 mb-5">
                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                <p className="text-2xl font-bold font-mono text-primary">{orderId}</p>
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
    </div>
  );
}
