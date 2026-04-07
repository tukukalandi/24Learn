import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email Address",
      value: "dakshiksha@gmail.com",
      href: "mailto:dakshiksha@gmail.com",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Phone,
      label: "Mobile Number",
      value: "+91 8249574543",
      href: "tel:+918249574543",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      icon: MapPin,
      label: "Office Location",
      value: "Dhenkanal Postal Division, Odisha",
      href: "#",
      color: "text-postal-red",
      bg: "bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-postal-bg flex flex-col font-sans selection:bg-postal-red selection:text-white">
      <div className="flex-1 relative overflow-hidden py-12">
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/250px-India_Post.svg.png" 
            alt="Watermark" 
            className="w-full max-w-5xl object-contain rotate-12 grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Contact Us</h2>
              <p className="text-sm text-slate-500">Get in touch with the DakShiksha team</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className={`${item.bg} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                    <item.icon className={item.color} size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-800">{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="bg-postal-red p-6 text-white">
                  <h3 className="text-xl font-bold">Send us a Message</h3>
                  <p className="text-sm opacity-80">We'll get back to you as soon as possible.</p>
                </div>
                <form className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-postal-red focus:ring-2 focus:ring-postal-red/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-postal-red focus:ring-2 focus:ring-postal-red/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Subject</label>
                    <input 
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-postal-red focus:ring-2 focus:ring-postal-red/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Your message here..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-postal-red focus:ring-2 focus:ring-postal-red/20 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="button"
                    className="w-full md:w-auto px-8 py-4 bg-postal-red text-white font-bold rounded-lg shadow-lg shadow-postal-red/30 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
