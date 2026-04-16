"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, Globe, Award, Factory, Briefcase, ExternalLink,
  ChevronRight, TrendingUp, Rocket
} from 'lucide-react';

const milestones = [
  { year: '2008', title: 'Foundation', desc: 'Established as a specialized precision tool workshop in Berlin.', icon: <Factory size={16}/> },
  { year: '2012', title: 'ISO Certification', desc: 'Achieved global quality standards, opening doors to EU markets.', icon: <Award size={16}/> },
  { year: '2017', title: 'Global Expansion', desc: 'Opened regional distribution hubs in Dubai and Singapore.', icon: <Globe size={16}/> },
  { year: '2024', title: 'Industry 4.0', desc: 'Fully automated production line with AI-driven QC integration.', icon: <Rocket size={16}/> },
];

const HistoryAndTrade = () => {
  return (
    <section className="w-full bg-black py-24 px-6 lg:px-16 text-white border-t border-[#bc9848]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-20 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center md:justify-start gap-2 mb-4 text-[#bc9848] font-bold tracking-[0.2em] text-xs uppercase"
          >
            <History size={14} /> Heritage & Performance
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Our Journey & Global Impact</h2>
          <p className="text-gray-400 max-w-2xl text-lg">A proven track record of growth, innovation, and strategic global partnerships spanning over a decade.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: THE INTERACTIVE TIMELINE (5 Columns) */}
          <div className="lg:col-span-5 relative">
            {/* Timeline Line */}
            <div className="absolute left-4.75 top-4 bottom-4 w-px bg-linear-to-b from-[#bc9848] via-[#6a4e0a]/30 to-transparent" />
            
            <div className="space-y-12">
              {milestones.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative pl-12 group"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-black border-2 border-[#bc9848]/20 flex items-center justify-center z-10 group-hover:border-[#bc9848] transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,1)]">
                    <div className="w-2 h-2 rounded-full bg-[#6a4e0a] group-hover:bg-[#bc9848] group-hover:scale-150 transition-all" />
                  </div>
                  
                  <span className="text-[#bc9848] font-black text-sm mb-1 block tracking-widest">{item.year}</span>
                  <h4 className="text-xl font-bold mb-2 flex items-center gap-3 text-white">
                    {item.title} <span className="text-[#bc9848]/20">{item.icon}</span>
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: TRADE STATS & CASE STUDIES (7 Columns) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Quick Trade Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <TradeStat label="Years Active" value="16+" />
              <TradeStat label="Projects Delivered" value="1.2k" />
              <TradeStat label="Countries Reached" value="32" />
            </div>

            {/* Success Stories Header */}
            <div className="pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#bc9848] mb-6 flex items-center gap-2">
                <Briefcase size={14} /> Featured Success Stories
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CaseStudyCard 
                  title="Aviation Component Supply" 
                  client="Lufthansa Tech" 
                  result="Zero defect rate over 24 months"
                  img="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800"
                />
                <CaseStudyCard 
                  title="Smart Factory Integration" 
                  client="Siemens Partner" 
                  result="+40% Production Efficiency"
                  img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                />
              </div>
            </div>

            {/* Performance Indicator Banner */}
            <div className="p-6 rounded-[28px] bg-[#ffffff]/5 border border-[#bc9848]/10 flex items-center justify-between group cursor-pointer hover:border-[#bc9848]/40 transition-all">
               <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-[#6a4e0a]/20 text-[#bc9848] border border-[#bc9848]/20">
                   <TrendingUp size={24} />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-white">2024 Trade Performance Report</p>
                   <p className="text-xs text-gray-500 italic">Audit verified export and growth metrics.</p>
                 </div>
               </div>
               <ExternalLink size={18} className="text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- Sub-Components ---

const TradeStat = ({ label, value }) => (
  <div className="p-6 rounded-3xl bg-[#ffffff]/5 border border-[#bc9848]/10 text-center md:text-left hover:border-[#bc9848]/30 transition-colors group">
    <p className="text-3xl font-bold text-white mb-1 group-hover:text-[#bc9848] transition-colors">{value}</p>
    <p className="text-[10px] font-black text-[#6a4e0a] uppercase tracking-widest leading-none group-hover:text-[#bc9848] transition-colors">{label}</p>
  </div>
);

const CaseStudyCard = ({ title, client, result, img }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="relative h-70 rounded-4xl overflow-hidden border border-[#bc9848]/10 group cursor-pointer"
  >
    {/* Image with Dark Overlay */}
    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${img})` }} />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    
    <div className="absolute bottom-6 left-6 right-6">
      <p className="text-[10px] font-bold text-[#bc9848] uppercase tracking-widest mb-1">{client}</p>
      <h4 className="text-lg font-bold mb-3 text-white">{title}</h4>
      <div className="flex items-center justify-between pt-3 border-t border-[#bc9848]/20">
        <span className="text-[11px] text-gray-400 font-medium">{result}</span>
        <ChevronRight size={14} className="text-[#bc9848] group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

export default HistoryAndTrade;