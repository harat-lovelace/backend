import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from './AuthContext';
import {
  Waves,
  ArrowRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Play,
  Star,
  ChevronDown,
  Check,
  Phone,
  ArrowUpRight,
  HelpCircle,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Heart
} from 'lucide-react';

// Import local assets generated using generate_image
import laundryHero from '../../assets/laundry_hero.png';
import laundryAbout from '../../assets/laundry_about.png';
import laundryProcess from '../../assets/laundry_process.png';
import laundryLogo from '../../assets/laundry_logo.png';

// Reusable Laundry Bubbles background overlay component
function LaundryBubbles({ className = "" }: { className?: string }) {
  const bubbleList = [
    { size: 'w-4 h-4 md:w-6 md:h-6', top: 'top-[8%]', left: 'left-[12%]', delay: '0s', duration: '12s' },
    { size: 'w-10 h-10 md:w-16 md:h-16', top: 'top-[22%]', left: 'left-[82%]', delay: '2s', duration: '18s' },
    { size: 'w-8 h-8 md:w-12 md:h-12', top: 'top-[45%]', left: 'left-[4%]', delay: '4s', duration: '15s' },
    { size: 'w-16 h-16 md:w-24 md:h-24', top: 'top-[68%]', left: 'left-[88%]', delay: '1s', duration: '20s' },
    { size: 'w-5 h-5 md:w-8 md:h-8', top: 'top-[82%]', left: 'left-[15%]', delay: '3s', duration: '10s' },
    { size: 'w-12 h-12 md:w-20 md:h-20', top: 'top-[14%]', left: 'left-[45%]', delay: '5s', duration: '22s' },
    { size: 'w-6 h-6 md:w-10 md:h-10', top: 'top-[75%]', left: 'left-[35%]', delay: '2.5s', duration: '14s' },
    { size: 'w-5 h-5 md:w-7 md:h-7', top: 'top-[35%]', left: 'left-[92%]', delay: '6s', duration: '11s' },
    { size: 'w-12 h-12 md:w-16 md:h-16', top: 'top-[58%]', left: 'left-[42%]', delay: '0.5s', duration: '19s' },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {bubbleList.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full border border-blue-200/30 bg-gradient-to-tr from-blue-300/10 via-white/5 to-white/40 shadow-[inset_-2px_-2px_6px_rgba(59,130,246,0.1),inset_2px_2px_6px_rgba(255,255,255,0.4),0_4px_12px_rgba(59,130,246,0.05)] backdrop-blur-[0.5px] animate-float-bubble ${b.size} ${b.top} ${b.left}`}
          style={{
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        >
          {/* Internal reflection highlight */}
          <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/60"></div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do you maintain the quality of each cleaning?",
      a: "We separate clothes carefully by fabric type, color, and soil level. We use premium, eco-friendly detergents and set customized wash cycles. Every batch is individually handled to ensure absolute hygiene."
    },
    {
      q: "What is the average turnaround time?",
      a: "Our standard turnaround time is 24 to 48 hours. For customers in a rush, we offer our Express Laundry Service which gets your laundry washed, dried, and folded in just 1 hour."
    },
    {
      q: "Do you offer free pickup and delivery?",
      a: "Yes! Our Standard and Premium plans include free door-to-door pickup and delivery within Cogon and surrounding areas of Balingasag. A small convenience fee applies to other areas."
    },
    {
      q: "How can I track my order status?",
      a: "You can track your order in real-time. Simply go to the Tracking page, enter your Order ID, and see if your clothes are being washed, dried, or ready for delivery."
    },
    {
      q: "What happens if a garment is damaged or lost?",
      a: "We take extreme care of all items in our possession. In the highly unlikely event of damage or loss, our service is fully insured and covered under our customer protection guarantee."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-24 px-4 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-blue-100/50">
        <LaundryBubbles />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
              <span>Premium Laundry Care</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Your Laundry, <br className="hidden sm:inline" />
              Our <span className="text-blue-600 relative inline-block">
                Spin Perfection
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-yellow-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Worry less about laundry. We wash, dry, fold, and press your garments to pristine condition with expert care. Get back your valuable time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Book Laundry Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to={isAuthenticated ? (user?.role === 'admin' ? '/admin/orders' : '/track') : '/login'}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 px-8 py-4 rounded-2xl font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-5 h-5 text-blue-600" />
                Track Order
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> 100% Satisfaction Guaranteed
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Same Day Available
              </span>
            </div>
          </div>
          
          {/* Hero Right Content */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            
            {/* Background design elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse duration-4000"></div>
            
            {/* Visual Frame */}
            <div className="relative max-w-[480px] lg:max-w-full">
              <img
                src={laundryHero}
                alt="Spinzy Washing Machine Mockup"
                className="w-full h-auto rounded-3xl object-cover drop-shadow-2xl border-4 border-white"
              />
              
              {/* Floating Badge 1 - Express Service */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl shadow-slate-100/80 border border-blue-50 flex items-center gap-3.5 max-w-[210px] animate-bounce duration-3000">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-slate-800">Only One Hour</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">Express Laundry Service</p>
                </div>
              </div>

              {/* Floating Badge 2 - Stat */}
              <div className="absolute bottom-12 -right-4 bg-white p-4 rounded-2xl shadow-xl shadow-slate-100/80 border border-blue-50 flex items-center gap-3.5 max-w-[200px]">
                <div className="bg-yellow-100 text-yellow-600 p-2.5 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-slate-800">100K+ Clothes</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">Spinned to Perfection</p>
                </div>
              </div>

              {/* Floating Badge 3 - Reviews */}
              <div className="absolute bottom-6 left-6 bg-white py-2 px-3.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">JD</div>
                  <div className="w-6 h-6 rounded-full bg-yellow-500 border border-white flex items-center justify-center text-[8px] text-white font-bold">MK</div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] text-white font-bold">EL</div>
                </div>
                <div className="flex items-center text-xs font-bold text-slate-800 gap-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span>5.0 (64K+)</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. PARTNERS / TRUST BAR */}
      <section className="bg-slate-900 text-white/70 py-10 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            We partner with premium detergent and fabric care brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-sm font-extrabold text-slate-400">
            <span className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
              <Sparkles className="w-4 h-4 text-blue-400" /> Tide Professional
            </span>
            <span className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
              <Sparkles className="w-4 h-4 text-blue-400" /> Downy Luxury
            </span>
            <span className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
              <Sparkles className="w-4 h-4 text-blue-400" /> Ariel Expert
            </span>
            <span className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
              <Sparkles className="w-4 h-4 text-blue-400" /> Vanish Oxi
            </span>
            <span className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
              <Sparkles className="w-4 h-4 text-blue-400" /> Comfort Soft
            </span>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION - "ELEVATE YOUR LAUNDRY EXPERIENCE" */}
      <section id="about" className="relative overflow-hidden py-24 px-4 bg-slate-50 border-b border-slate-200/60">
        <LaundryBubbles className="opacity-70" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Our History & Standard
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Elevate Your <br />
                Laundry Experience
              </h2>
              <p className="text-slate-600 leading-relaxed font-normal">
                At Mr. Laba-Laba, we combine state-of-the-art washing technology with carefully curated detergent formulas to protect your clothes. Our professional team handles each item with maximum care, promising you an unmatched laundry finish.
              </p>
              <div className="pt-4">
                <Link
                  to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </Link>
              </div>
            </div>
            
            {/* Center Image */}
            <div className="lg:col-span-4 flex justify-center">
              <img
                src={laundryAbout}
                alt="Professional laundry worker folding towel"
                className="rounded-3xl shadow-xl w-full max-w-[360px] object-cover h-[380px] border-4 border-white"
              />
            </div>
            
            {/* Right Cards */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold">
                  V
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-2">Our Vision</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  To be the gold standard of fabric care and convenience in Balingasag, bringing crisp, spotless garments to every household.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                <div className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold">
                  M
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-2">Our Mission</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  We commit to delivering eco-friendly, fast, and highly reliable laundry services through premium customer care and modern innovation.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              What We Do
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Services Designed For <br />
              Your Convenience
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              We offer comprehensive services ranging from quick express washes to premium dry cleaning and deep stain removal.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Laundry Express',
                desc: 'Your everyday wear, washed, dried, and perfectly folded in just 1 hour.',
                tag: 'Popular',
                img: 'https://images.unsplash.com/photo-1545173168-9f1947eebd01?auto=format&fit=crop&q=80&w=400',
              },
              {
                title: 'Dry Cleaning',
                desc: 'Premium chemical solvent care for your suits, gowns, silks, and delicate fabrics.',
                tag: 'Gentle Care',
                img: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=400',
              },
              {
                title: 'Ironing & Steam Pressing',
                desc: 'Crisp, professional wrinkles removal, leaving your dress shirts and pants sharp.',
                tag: 'Wrinkle-Free',
                img: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&q=80&w=400',
              },
              {
                title: 'Stain Treatment',
                desc: 'Specialized deep clean treatment for tough wine, oil, ink, and grease stains.',
                tag: 'Spotless',
                img: 'https://images.unsplash.com/photo-1607581780473-305141288b77?auto=format&fit=crop&q=80&w=400',
              },
            ].map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-slate-900 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
                    {service.tag}
                  </div>
                </div>
                <div className="p-6 text-left space-y-2">
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* 5. BLUE STATS BAR */}
      <section className="bg-blue-600 text-white py-16 px-4 border-y border-blue-700 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { num: '547+', label: 'Laundry Done' },
            { num: '324K+', label: 'Clothes Cleaned' },
            { num: '145+', label: 'Daily Scheduled' },
            { num: '4.9+', label: 'Years Experience' }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl md:text-5xl font-black text-yellow-300 tracking-tight">{stat.num}</p>
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PROCESS SECTION - "HOW WE SIMPLIFY YOUR LAUNDRY" */}
      <section className="py-24 px-4 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image & Call Box */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative max-w-[450px]">
                <img
                  src={laundryProcess}
                  alt="Customer in Laundromat"
                  className="rounded-3xl shadow-xl w-full object-cover h-[420px] border-4 border-white"
                />
                
                {/* Float Call Box */}
                <div className="absolute -bottom-6 right-6 bg-yellow-400 text-slate-900 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3.5 border-2 border-white">
                  <div className="bg-slate-900 text-white p-2 rounded-xl">
                    <Phone className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-800 uppercase font-extrabold tracking-wider leading-tight">Call Us Now</p>
                    <p className="text-sm font-black tracking-tight">+63 912 345 6789</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Steps */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Our Process
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  How Mr. Laba-Laba Simplifies <br />
                  Your Laundry Experience
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  We've streamlined the entire laundry flow so that you can book, track, and receive fresh clothes with zero stress.
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    title: 'Book Your Laundry',
                    desc: 'Select your plan or service online, set your preference, and finalize booking in seconds.'
                  },
                  {
                    title: 'Pickup by Shop',
                    desc: 'We will dispatch our courier to collect your laundry straight from your door.'
                  },
                  {
                    title: 'Expert Cleaning Process',
                    desc: 'Our staff separates garments, treats stains, and washes according to fabric specifications.'
                  },
                  {
                    title: 'Fast and Fresh Delivery',
                    desc: 'Your clothes are delivered right back to your door, smelling fresh and crisply folded.'
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 font-extrabold rounded-full w-9 h-9 flex items-center justify-center shrink-0 text-sm border border-blue-200">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-base">{step.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>



      {/* 8. TESTIMONIALS SECTION */}
      <section className="relative overflow-hidden py-24 px-4 bg-blue-50/50 border-y border-blue-100/50">
        <LaundryBubbles className="opacity-60" />
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              What They Say About Mr. Laba-Laba
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Discover why hundreds of families in Balingasag trust us with their everyday wear.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Nick Patrick',
                role: 'Regular Customer',
                quote: 'Mr. Laba-Laba has saved me hours of house chores. Their Standard Plan pickup is always punctual, and clothes come back smelling incredibly fresh.',
                rating: 5,
                img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              },
              {
                name: 'Emmy Page',
                role: 'Business Owner',
                quote: 'I trust them with all my delicate office suits. The dry cleaning service is meticulous, and they even return them on hangers ready to wear.',
                rating: 5,
                img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
              },
              {
                name: 'Nicolle Jhon',
                role: 'Busy Parent',
                quote: 'With three kids, laundry is a never-ending cycle. The 1-hour express drop-off service is an absolute lifesaver when school starts.',
                rating: 5,
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow text-left space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic font-normal">
                    "{t.quote}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{t.name}</h4>
                    <p className="text-slate-400 text-[10px] font-bold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Support FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Frequently Asked <br />
                Questions
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Can't find what you're looking for? Reach out to our customer care team anytime. We're always here to assist.
              </p>
              <div className="pt-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-xs"
                >
                  Contact Support
                  <Mail className="w-4 h-4 text-yellow-300" />
                </a>
              </div>
            </div>
            
            {/* Right Accordion Column */}
            <div className="lg:col-span-7 space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isOpen ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-sm md:text-base pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-48 border-t border-slate-100 p-5' : 'max-h-0'
                      }`}
                    >
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      </section>

      {/* 10. OUR LATEST BLOG SECTION */}
      <section id="blog" className="relative overflow-hidden py-24 px-4 bg-slate-50 border-b border-slate-200/60">
        <LaundryBubbles className="opacity-70" />
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              News &amp; Tips
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Our Latest Blog
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Read useful tips on how to care for your fabrics, wash synthetics, and maintain garment color.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Future of Laundry Services',
                desc: 'How smart washers and localized apps are changing fabric processing times.',
                date: 'May 20, 2026',
                category: 'Industry',
                img: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&q=80&w=400'
              },
              {
                title: 'Ultimate Laundry Service Insights',
                desc: 'Understanding the difference between steam pressing and normal hand ironing.',
                date: 'May 14, 2026',
                category: 'Ironing Tips',
                img: 'https://images.unsplash.com/photo-1517677208151-24c5ba585763?auto=format&fit=crop&q=80&w=400'
              },
              {
                title: 'Sustainable Fabric Cleaning Tips',
                desc: 'Eco-friendly tips to remove ink stains using simple house items.',
                date: 'May 08, 2026',
                category: 'Stain Care',
                img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
              }
            ].map((blog, idx) => (
              <article key={idx} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.img}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 left-3 bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {blog.category}
                    </span>
                  </div>
                  
                  <div className="p-6 text-left space-y-3">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{blog.date}</p>
                    <h3 className="font-extrabold text-slate-800 text-base group-hover:text-blue-600 transition-colors leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      {blog.desc}
                    </p>
                  </div>
                </div>
                
                <div className="px-6 pb-6 pt-2 text-left">
                  <a
                    href="#blog"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:gap-1.5 transition-all"
                  >
                    Read More
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          
        </div>
      </section>

      {/* 11. NEWSLETTER BAND */}
      <section className="bg-blue-600 text-white py-14 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left space-y-2">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Follow Us For More Information
            </h3>
            <p className="text-blue-100 text-xs md:text-sm font-medium">
              Subscribe to get seasonal promo codes and laundry tips.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto items-center max-w-md shrink-0 gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full md:w-64 font-medium transition-all"
            />
            <button
              onClick={() => alert('Successfully subscribed!')}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl text-sm font-black transition-colors shadow-md shrink-0"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* 12. COMPREHENSIVE FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-20 pb-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
          
          {/* Logo & Brand Pitch */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="flex items-center gap-2">
              <img
                src={laundryLogo}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-md"
                alt="Mr. Laba-Laba Logo"
              />
              <span className="font-extrabold text-white text-lg tracking-tight">
                Mr. Laba-Laba
              </span>
            </div>
            <p className="text-xs leading-relaxed font-semibold max-w-sm">
              Premium fabric cleaning, dry cleaning, and steaming services. We treat your garments with utmost care, offering free door-to-door delivery.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors duration-200" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors duration-200" title="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-200" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors">Latest News</a></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Laundry Express (1h)</Link></li>
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Delicate Dry Cleaning</Link></li>
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Garment Steam Pressing</Link></li>
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Tough Stain Treatment</Link></li>
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Blanket &amp; Duvet Wash</Link></li>
              <li><Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/order') : '/login'} className="hover:text-white transition-colors">Free Courier Collection</Link></li>
            </ul>
          </div>
          
          {/* Contact Details Column */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">
              Get In Touch
            </h4>
            <ul className="space-y-3.5 text-xs font-semibold text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Cogon, Balingasag,<br />Misamis Oriental, 9005 Philippines</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+63 912 345 6789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>hello@mrlabalaba.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Mon–Sat: 8:00 AM – 8:00 PM<br />Sunday: Closed</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Sub-footer Copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 font-semibold text-slate-500">
          <span>© 2026 Mr. Laba-Laba Laundry Services. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <span className="flex items-center gap-1 text-[10px]">
            Designed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for pristine cleanliness
          </span>
        </div>
      </footer>
      
    </div>
  );
}
