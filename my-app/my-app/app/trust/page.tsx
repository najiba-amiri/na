"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, Download, Award, 
  CheckCircle2, Lock, Eye, X 
} from 'lucide-react';

const certificates = [
  { id: 1, name: 'ISO 9001:2015', issuer: 'SGS Global', icon: 'ISO' },
  { id: 2, name: 'CE Compliance', issuer: 'TÜV Rheinland', icon: 'CE' },
  { id: 3, name: 'RoHS Directive', issuer: 'Intertek', icon: 'RoHS' },
  { id: 4, name: 'UL Safety Cert', issuer: 'Underwriters Lab', icon: 'UL' },
];

const TrustSection = () => {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <section className="w-full bg-black py-24 px-6 lg:px-16 text-white border-t border-[#bc9848]/10 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-[#6a4e0a]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 1. TOP TRUST BANNER - Monochromatic Gold Style */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-20 py-8 border-y border-[#bc9848]/10 bg-white/2 backdrop-blur-sm">
          <TrustBadge icon={<ShieldCheck size={18}/>} text="Verified Supplier" />
          <div className="h-4 w-px bg-[#bc9848]/20 hidden md:block" />
          <TrustBadge icon={<Award size={18}/>} text="Quality Assured" />
          <div className="h-4 w-px bg-[#bc9848]/20 hidden md:block" />
          <TrustBadge icon={<CheckCircle2 size={18}/>} text="Global Compliance" />
        </div>

        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            className="text-[#bc9848] font-bold tracking-[0.3em] text-[10px] uppercase mb-4"
          >
            International Standards
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Certifications & Compliance</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Our operations strictly adhere to international quality standards, verified by world-leading inspection authorities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 2. ZONE: CERTIFICATES SHOWCASE (8 Columns) */}
          <div className="lg:col-span-8 space-y-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#bc9848] flex items-center gap-3">
              <Lock size={14} /> Official Certifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  whileHover={{ y: -8, backgroundColor: "rgba(188, 152, 72, 0.05)" }}
                  className="relative group p-8 rounded-[40px] bg-white/5 border border-[#bc9848]/10 overflow-hidden transition-all duration-500"
                >
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 border border-[#bc9848]/20 group-hover:border-[#bc9848] transition-all duration-500">
                        <span className="text-sm font-black text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors">{cert.icon}</span>
                      </div>
                      <h4 className="text-xl font-bold mb-1 text-white group-hover:text-[#bc9848] transition-colors">{cert.name}</h4>
                      <p className="text-sm text-gray-500 italic">Issued by {cert.issuer}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedCert(cert.id)}
                      className="p-3 rounded-full bg-black border border-[#bc9848]/20 text-[#bc9848] hover:bg-[#bc9848] hover:text-black transition-all shadow-lg"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  
                  {/* Subtle Glow Background */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#bc9848]/5 blur-[50px] group-hover:bg-[#bc9848]/10 transition-all" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* 3. ZONE: INSPECTION & REPORTS (4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Audit Reports</h3>
            
            <div className="space-y-4">
              <ReportCard title="Full Factory Audit 2024" size="4.2 MB" />
              <ReportCard title="Social Compliance Report" size="1.8 MB" />
              <ReportCard title="Environmental Impact" size="2.5 MB" />
            </div>

            {/* REGISTERED BRANDS */}
            <div className="pt-10 border-t border-[#bc9848]/10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Trademarks</h3>
              <div className="grid grid-cols-3 gap-4 opacity-30 group-hover:opacity-60 transition-all">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-white/5 border border-[#bc9848]/10 rounded-2xl flex items-center justify-center p-4">
                    <div className="w-full h-1 bg-[#6a4e0a]/20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-3xl w-full aspect-3/4 bg-[#0a0a0a] rounded-[40px] border border-[#bc9848]/30 p-8 relative overflow-hidden shadow-[0_0_100px_rgba(188,152,72,0.1)]"
            >
              <div className="w-full h-full border border-dashed border-[#bc9848]/20 rounded-4xl flex flex-col items-center justify-center text-[#6a4e0a] gap-4">
                <FileText size={64} strokeWidth={1} />
                <p className="text-sm font-bold uppercase tracking-widest">Document Preview</p>
                <div className="text-[10px] text-gray-600">Verifying security signatures...</div>
              </div>
              
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-10 right-10 p-2 bg-[#bc9848] text-black rounded-full hover:bg-[#6a4e0a] transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Sub-components
const TrustBadge = ({ icon, text }) => (
  <div className="flex items-center gap-3 group cursor-default">
    <div className="p-2.5 rounded-xl bg-black border border-[#bc9848]/20 text-[#bc9848] group-hover:shadow-[0_0_15px_rgba(188,152,72,0.2)] transition-all duration-500">
      {icon}
    </div>
    <span className="text-xs font-black text-gray-300 group-hover:text-[#bc9848] transition-colors uppercase tracking-widest">{text}</span>
  </div>
);

const ReportCard = ({ title, size }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: "rgba(188, 152, 72, 0.05)" }}
    className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-[#bc9848]/10 hover:border-[#bc9848]/40 group transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-black border border-[#bc9848]/20 rounded-2xl text-[#bc9848]">
        <FileText size={20} />
      </div>
      <div>
        <p className="text-sm font-bold text-white group-hover:text-[#bc9848] transition-colors">{title}</p>
        <p className="text-[10px] text-[#6a4e0a] font-black uppercase tracking-widest">{size}</p>
      </div>
    </div>
    <button className="p-2.5 text-gray-600 group-hover:text-[#bc9848] transition-all">
      <Download size={18} />
    </button>
  </motion.div>
);

export default TrustSection;