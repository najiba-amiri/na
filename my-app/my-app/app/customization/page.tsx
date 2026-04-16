"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Settings, Microscope, CheckCircle2, 
  PenTool, Layers, ArrowRight,
  Beaker, ShieldCheck
} from 'lucide-react';

const CustomizationCapabilities = () => {
  return (
    <section className="w-full bg-black py-24 px-6 lg:px-16 text-white border-t border-[#bc9848]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-[#bc9848] font-bold tracking-[0.2em] text-xs uppercase"
          >
            <Settings size={14} /> Technical Engineering
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Customization & R&D</h2>
          <p className="text-gray-400 max-w-2xl text-lg">
            From initial concept to mass production, we provide full-spectrum OEM and ODM solutions tailored to your technical requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PILLAR 1: R&D INNOVATION (Left - 4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-4xl bg-[#ffffff]/5 border border-[#bc9848]/20 relative overflow-hidden group h-full">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#6a4e0a]/20 flex items-center justify-center text-[#bc9848] mb-8 border border-[#bc9848]/30">
                  <Microscope size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">R&D Strength</h3>
                <div className="space-y-6 mb-8">
                  <StatItem label="Active Patents" value="45+" />
                  <StatItem label="R&D Engineers" value="28 Specialists" />
                  <StatItem label="Annual R&D Spend" value="12% Revenue" />
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#bc9848] uppercase tracking-widest">Innovation Focus</p>
                  {['Nano-Materials', 'Smart Automation', 'Eco-Efficiency'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#bc9848]" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative Tech Grid Background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://transparenttextures.com')] scale-150" />
            </div>
          </div>

          {/* PILLAR 2: OEM/ODM SERVICES (Middle - 8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceCard 
                icon={<PenTool size={20} />} 
                title="Industrial Design" 
                desc="Custom mold development and structural engineering based on your CAD files."
              />
              <ServiceCard 
                icon={<Layers size={20} />} 
                title="Material Selection" 
                desc="Tailored chemical compositions and alloy grades for specific environments."
              />
              <ServiceCard 
                icon={<Cpu size={20} />} 
                title="Private Labeling" 
                desc="Premium laser etching, silk-screen printing, and custom retail packaging."
              />
              <ServiceCard 
                icon={<Beaker size={20} />} 
                title="Prototyping" 
                desc="Rapid 3D printing and CNC sampling within 7 business days."
              />
            </div>

            {/* PROCESS STEPPER */}
            <div className="p-8 rounded-4xl bg-white/5 border border-[#bc9848]/10 relative">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-10">Workflow Architecture</h4>
              <div className="relative flex justify-between items-start gap-4 flex-col md:flex-row">
                <Step number="01" label="Inquiry" />
                <StepArrow />
                <Step number="02" label="Technical Design" />
                <StepArrow />
                <Step number="03" label="Sample Approval" />
                <StepArrow />
                <Step number="04" label="Mass Production" />
              </div>
            </div>
          </div>

          {/* PILLAR 3: QUALITY CONTROL (Full Width Bottom) */}
          <div className="lg:col-span-12">
            <div className="p-8 rounded-4xl bg-linear-to-r from-[#6a4e0a]/10 to-transparent border border-[#bc9848]/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[#bc9848]/10 flex items-center justify-center text-[#bc9848] shadow-[0_0_30px_rgba(188,152,72,0.1)] border border-[#bc9848]/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Rigorous Quality Assurance</h3>
                  <p className="text-gray-500 text-sm">Every custom unit undergoes 100% inspection before dispatch.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <QCBadge label="Incoming Material Test" />
                <QCBadge label="In-Process QC" />
                <QCBadge label="Final Stress Test" />
                <QCBadge label="Third-Party Inspection" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- Sub-Components ---

const StatItem = ({ label, value }) => (
  <div>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-xs text-[#bc9848] font-medium uppercase tracking-wider">{label}</p>
  </div>
);

const ServiceCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5, backgroundColor: 'rgba(188, 152, 72, 0.05)', borderColor: 'rgba(188, 152, 72, 0.3)' }}
    className="p-6 rounded-3xl bg-[#ffffff]/5 border border-white/5 transition-all group"
  >
    <div className="text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors mb-4">{icon}</div>
    <h4 className="font-bold mb-2 text-white">{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const Step = ({ number, label }) => (
  <div className="flex flex-col items-center md:items-start text-center md:text-left group">
    <span className="text-xs font-black text-[#bc9848] mb-2 px-2 py-1 bg-[#bc9848]/10 rounded">{number}</span>
    <span className="text-sm font-semibold text-white group-hover:text-[#bc9848] transition-colors">{label}</span>
  </div>
);

const StepArrow = () => (
  <div className="hidden md:flex items-center pt-8 text-[#6a4e0a]">
    <ArrowRight size={16} />
  </div>
);

const QCBadge = ({ label }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-[#bc9848]/20 text-xs font-medium text-gray-300 hover:border-[#bc9848] transition-all">
    <CheckCircle2 size={14} className="text-[#bc9848]" /> {label}
  </div>
);

export default CustomizationCapabilities