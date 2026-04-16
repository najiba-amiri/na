"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import{ Menu, Wifi, ChevronRight, Clock } from 'lucide-react';

const GlobenterExperience = () => {
  const { scrollY } = useScroll();
  const yLogo = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityLogo = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <main className="relative w-full h-screen bg-[#050505] text-white overflow-hidden selection:bg-[#bc9848] selection:text-black font-sans">
      
      {/* --- 1. INTELLIGENT COMMAND BAR (HUD) --- */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-6 left-6 right-6 z-50 flex justify-between items-start pointer-events-none"
      >
        {/* Left: Live System Status */}
        <div className="flex flex-col gap-2 pointer-events-auto">
           <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-[#bc9848]/20 backdrop-blur-md shadow-[0_0_20px_rgba(188,152,72,0.1)]">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bc9848] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#bc9848]"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#bc9848]">
                Systems Online
              </span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 pl-2">
              <Wifi size={10} /> Encrypted Connection
           </div>
        </div>

        {/* Right: Interactive Action Hub */}
        <div className="flex items-center gap-3 pointer-events-auto">
           {/* Live Clock Widget */}
           <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
              <Clock size={14} className="text-[#6a4e0a]" />
              <TimeDisplay />
           </div>

           {/* Menu Trigger */}
           <button className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-[#bc9848] text-black hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(188,152,72,0.4)]">
              <Menu size={20} strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
           </button>
        </div>
      </motion.div>

      {/* --- 2. CINEMATIC BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#121212_0%,#000000_80%)]" />
        {/* Golden Mesh Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ 
            backgroundImage: 'linear-gradient(#bc9848 0.5px, transparent 0.5px), linear-gradient(90deg, #bc9848 0.5px, transparent 0.5px)', 
            backgroundSize: '80px 80px' 
          }} 
        />
        {/* Animated Spotlight behind Logo */}
        <motion.div 
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#bc9848]/10 blur-[100px] rounded-full pointer-events-none" 
        />
      </div>

      {/* --- 3. HERO CENTER (Logo Integration) --- */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full pb-20 px-6">
        
        {/* Brand Tagline (Above Logo) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="h-px w-8 bg-linear-to-r from-transparent to-[#bc9848]" />
          <span className="text-[#bc9848] font-bold tracking-[0.3em] text-[10px] uppercase">
            Est. 2008 • Kabul
          </span>
          <div className="h-px w-8 bg-linear-to-l from-transparent to-[#bc9848]" />
        </motion.div>

        {/* MAIN LOGO PLACEHOLDER */}
        <motion.div 
            style={{ y: yLogo, opacity: opacityLogo }} 
            className="relative w-full max-w-2xl flex justify-center items-center group"
        >
            {/* Decorative Energy Rings (Behind Logo) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[120%] h-[120%] border border-[#bc9848]/10 rounded-full animate-spin-slow opacity-30" />
                <div className="absolute w-[140%] h-px bg-linear-to-r from-transparent via-[#bc9848]/20 to-transparent" />
            </div>

            {/* LOGO IMAGE */}
            <motion.img 
                initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                
                src="/logo.png"
                alt="Globenter Logo"
                
                className="relative z-20 w-full max-w-100 md:max-w-125 object-contain mix-blend-screen drop-shadow-[0_0_25px_rgba(188,152,72,0.3)]"
            />
        </motion.div>

        {/* Call to Action (Below Logo) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16"
        >
           <button className="flex items-center gap-3 px-8 py-3 rounded-xl border border-[#bc9848]/30 text-[#bc9848] hover:bg-[#bc9848] hover:text-black transition-all duration-500 group backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <span className="font-bold uppercase tracking-[0.2em] text-xs">Enter Platform</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>

      {/* --- 4. BOTTOM CONTROL STRIP --- */}
      <div className="absolute bottom-0 left-0 w-full h-16 border-t border-white/5 bg-black/40 backdrop-blur-lg flex items-center justify-between px-8 z-20">
         <p className="text-[10px] text-gray-600 uppercase tracking-widest">
           Server: Stable
         </p>
         
         {/* Scrolling Ticker */}
         <div className="hidden md:flex items-center gap-8 overflow-hidden w-1/3 mask-linear-fade">
            <div className="flex gap-8 animate-marquee whitespace-nowrap text-[10px] text-gray-400 font-mono">
               <span className="text-[#bc9848]">DOLLAR: $65.53 ▲</span>
               <span>EURO: $82.40 ▼</span>
               <span>KABUL: MARKET OPEN</span>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#bc9848] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest"> © 2026 Designed by Elyas Alowdin.</span>
         </div>
      </div>

    </main>
  );
};

// Helper: Live Clock
const TimeDisplay = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    // Set safe initial time
    setTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kabul', hour12: false, hour: '2-digit', minute: '2-digit' }));
    
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kabul', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="font-mono text-xs font-bold tracking-widest text-gray-300">
      {time} <span className="text-[#6a4e0a]">KBL</span>
    </span>
  );
};

export default GlobenterExperience;