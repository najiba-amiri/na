"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, 
  MessageSquare, Clock, ShieldCheck, Check 
} from 'lucide-react';

const ContactSection = () => {
  const [formStatus, setFormStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('loading');
    setTimeout(() => setFormStatus('success'), 2000);
  };

  return (
    <section className="w-full bg-black py-24 px-6 lg:px-16 text-white border-t border-[#bc9848]/10 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[#6a4e0a]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
        
        {/* LEFT SIDE: Contact & Trust */}
        <div className="lg:col-span-5 space-y-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4 text-[#bc9848] font-bold tracking-[0.2em] text-xs uppercase"
            >
              <MessageSquare size={14} /> Global Inquiry
            </motion.div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-balance">Let's Build Something Great Together.</h2>
            <p className="text-gray-400 text-lg">Connect with our enterprise team for custom quotes, technical consultations, or global partnerships.</p>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4">
            <ContactCard 
              icon={<Mail size={20} />} 
              label="Email Us" 
              value="partners@titanglobal.com" 
              sub="Response within 12 hours"
            />
            <ContactCard 
              icon={<Phone size={20} />} 
              label="Direct Line" 
              value="+49 (30) 9832-0412" 
              sub="Mon-Fri, 9am - 6pm CET"
            />
            <div className="p-6 rounded-4xl bg-white/5 border border-[#bc9848]/10 group hover:border-[#bc9848]/30 transition-all">
              <div className="flex gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Headquarters</p>
                  <p className="text-sm font-medium text-gray-200">Tiergartenstrasse 15, 10785 Berlin, Germany</p>
                </div>
              </div>
              {/* Mock Map Preview */}
              <div className="w-full h-32 rounded-2xl bg-[#0a0a0a] border border-[#bc9848]/10 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com')]" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-3 h-3 bg-[#bc9848] rounded-full animate-ping" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">View on Interactive Map</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#bc9848]/5 border border-[#bc9848]/20 rounded-full text-[10px] font-bold text-[#bc9848] uppercase tracking-widest">
              <Clock size={12} /> Avg Response: 3h
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
              <ShieldCheck size={12} /> Secured Connection
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Inquiry Form */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[40px] bg-[#ffffff]/5 border border-[#bc9848]/20 backdrop-blur-3xl shadow-2xl relative"
          >
            <AnimatePresence mode="wait">
              {formStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-[#bc9848]/20 text-[#bc9848] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#bc9848]/30">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">Inquiry Sent Successfully</h3>
                  <p className="text-gray-400">Our team has received your message and will reach out shortly.</p>
                  <button onClick={() => setFormStatus('idle')} className="text-[#bc9848] font-bold text-sm uppercase tracking-widest hover:underline hover:text-[#6a4e0a] transition-colors">Send another message</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Full Name" placeholder="John Doe" required />
                    <FormInput label="Email Address" placeholder="john@company.com" type="email" required />
                  </div>
                  <FormInput label="Company Name" placeholder="Enterprise Ltd." />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#bc9848] uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full bg-black border border-[#bc9848]/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#bc9848] focus:ring-1 focus:ring-[#bc9848] transition-all placeholder:text-gray-700 text-white"
                      placeholder="Tell us about your project requirements..."
                    />
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.01, backgroundColor: "#6a4e0a" }} whileTap={{ scale: 0.98 }}
                    disabled={formStatus === 'loading'}
                    className="w-full py-5 bg-[#bc9848] text-black font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(188,152,72,0.15)] flex items-center justify-center gap-3 text-lg overflow-hidden relative"
                  >
                    {formStatus === 'loading' ? (
                      <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        SUBMIT INQUIRY
                      </>
                    )}
                  </motion.button>

                  <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest pt-4">
                    By submitting, you agree to our <span className="text-[#bc9848] hover:text-white cursor-pointer underline transition-colors">Privacy Policy</span>
                  </p>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

// --- Sub-Components ---

const ContactCard = ({ icon, label, value, sub }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: "rgba(188, 152, 72, 0.08)" }}
    className="p-6 rounded-[28px] bg-white/5 border border-[#bc9848]/10 flex items-start gap-5 group transition-all"
  >
    <div className="p-3 rounded-2xl bg-black border border-[#bc9848]/20 text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-[#bc9848] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  </motion.div>
);

const FormInput = ({ label, ...props }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black text-[#bc9848] uppercase tracking-widest ml-1">{label}</label>
    <input 
      {...props}
      className="w-full bg-black border border-[#bc9848]/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#bc9848] focus:ring-1 focus:ring-[#bc9848] transition-all placeholder:text-gray-700 text-white"
    />
  </div>
);

export default ContactSection;