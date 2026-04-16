"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, Users, BarChart3, Globe2, 
  Package, Activity 
} from 'lucide-react';

const stats = [
  { label: 'Factory Size', value: '15,000', unit: 'm²', icon: Factory },
  { label: 'Total Employees', value: '250', unit: '+', icon: Users },
  { label: 'Annual Output', value: '$50M', unit: '+', icon: BarChart3 },
  { label: 'Main Markets', value: '32', unit: 'Countries', icon: Globe2 },
];

const BusinessDetails = () => {
  return (
    <section className="w-full bg-black py-20 px-6 lg:px-16 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-3"
          >
            <span className="h-px w-8 bg-[#bc9848]"></span>
            <span className="text-[#bc9848] font-bold tracking-widest text-xs uppercase">Enterprise Capabilities</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Business Scale & Operations</h2>
          <p className="text-gray-400 mt-2 max-w-2xl">A comprehensive overview of our production capacity, global reach, and operational infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Key Metrics Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, backgroundColor: "rgba(188, 152, 72, 0.05)" }}
                  className="p-6 rounded-3xl bg-[#ffffff]/5 border border-[#bc9848]/20 backdrop-blur-md transition-all group"
                >
                  <stat.icon className="w-6 h-6 text-[#6a4e0a] group-hover:text-[#bc9848] mb-4 transition-colors" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-[10px] text-[#bc9848] font-medium uppercase">{stat.unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Products - Pill UI */}
            <div className="p-8 rounded-4xl bg-[#ffffff]/5 border border-[#bc9848]/10 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Package size={20} className="text-[#bc9848]" /> Core Product Categories
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {['Precision Tools', 'Heavy Machinery', 'Automated Systems', 'Industrial Sensors', 'CNC Components'].map((tag) => (
                  <button key={tag} className="px-5 py-2.5 rounded-full bg-black border border-[#6a4e0a]/40 text-sm font-medium hover:bg-[#bc9848] hover:text-black hover:border-[#bc9848] transition-all duration-300">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Production Capacity Detailed Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-4xl bg-linear-to-b from-[#6a4e0a]/10 to-transparent border border-[#bc9848]/10">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#bc9848] mb-6">Operational Scale</h4>
                <div className="space-y-4">
                  <DetailRow label="Production Lines" value="12 Active" />
                  <DetailRow label="R&D Engineers" value="45 Specialists" />
                  <DetailRow label="Quality Control" value="ISO 9001:2015" />
                  <DetailRow label="OEM/ODM" value="Supported" />
                </div>
              </div>
              <div className="p-8 rounded-4xl bg-linear-to-b from-[#6a4e0a]/10 to-transparent border border-[#bc9848]/10">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#bc9848] mb-6">Market Reach</h4>
                <div className="space-y-4">
                  <DetailRow label="Export Ratio" value="85%" />
                  <DetailRow label="Lead Time" value="15-30 Days" />
                  <DetailRow label="Min. Order" value="$5,000 USD" />
                  <DetailRow label="Port" value="Hamburg / Rotterdam" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Data Visualization & Distribution */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-4xl bg-[#ffffff]/5 border border-[#bc9848]/20 backdrop-blur-2xl h-full shadow-2xl">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-white">
                <Activity size={20} className="text-[#bc9848]" /> Market Distribution
              </h3>
              
              <div className="space-y-8">
                <MarketProgress label="Europe & North America" percentage={45} color="#bc9848" />
                <MarketProgress label="Asia Pacific" percentage={30} color="#6a4e0a" />
                <MarketProgress label="Middle East" percentage={15} color="#ffffff" />
                <MarketProgress label="Others" percentage={10} color="#333333" />
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-[#6a4e0a]/10 border border-[#bc9848]/20">
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "Our production facilities utilize Tier-1 automation to ensure 99.9% precision in every batch."
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-[#6a4e0a] border border-[#bc9848]/30"></div>
                   <div>
                     <p className="text-[10px] font-bold text-white">Marcus Thorne</p>
                     <p className="text-[10px] text-[#bc9848]">Operations Director</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// Helper Components
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#bc9848]/10 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-[#bc9848]">{value}</span>
  </div>
);

const MarketProgress = ({ label, percentage, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <span className="text-sm font-bold text-white">{percentage}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

export default BusinessDetails;