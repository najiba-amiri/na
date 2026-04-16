"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Maximize2, Camera, Video, Factory, Box, ChevronRight } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Media', icon: <Box size={14}/> },
  { id: 'factory', label: 'Factory Tour', icon: <Factory size={14}/> },
  { id: 'production', label: 'Production Line', icon: <Box size={14}/> },
  { id: 'video', label: 'Videos', icon: <Video size={14}/> },
];

const MediaGallery = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section className="w-full bg-black py-24 px-6 lg:px-16 text-white border-t border-[#bc9848]/10">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-3 text-[#bc9848] font-bold tracking-[0.2em] text-xs uppercase"
            >
              <Camera size={14} /> Visual Showcase
            </motion.div>
            <h2 className="text-4xl font-bold tracking-tight text-white">Media Gallery</h2>
            <p className="text-gray-400 mt-2">Explore our state-of-the-art facilities and precision engineering processes.</p>
          </div>

          {/* Premium Filter Tabs */}
          <div className="flex p-1.5 bg-white/5 rounded-2xl border border-[#bc9848]/10 backdrop-blur-md overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                  activeTab === cat.id ? 'bg-[#bc9848] text-black shadow-lg shadow-[#6a4e0a]/40' : 'text-gray-500 hover:text-[#bc9848]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:min-h-175">
          
          {/* FEATURED HERO TILE (Large Video) */}
          <motion.div 
            className="md:col-span-2 md:row-span-2 relative rounded-[40px] overflow-hidden group cursor-pointer border border-[#bc9848]/20 bg-[#0a0a0a]"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent z-10" />
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
               {/* Background Image / Video Mockup */}
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 transition={{ duration: 0.8 }}
                 className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"
               />
               <div className="z-20 p-10 absolute bottom-0 left-0 w-full">
                  <div className="flex items-center gap-3 mb-2 text-[#bc9848]">
                    <Play size={16} fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-widest">Featured Film</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Factory Operations 2024</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-md">A cinematic journey through our automated assembly lines and quality control sectors.</p>
               </div>
               {/* Play Button Glow */}
               <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-20 h-20 rounded-full bg-[#bc9848] flex items-center justify-center shadow-[0_0_50px_rgba(188,152,72,0.4)]">
                    <Play size={32} fill="black" className="ml-1" />
                  </div>
               </div>
            </div>
          </motion.div>

          {/* SECONDARY TILES */}
          <div className="md:col-span-2 md:row-span-1 grid grid-cols-2 gap-4">
            <GalleryTile 
              title="Production Line" 
              icon={<Camera size={16}/>} 
              delay={0.1} 
              img="https://images.unsplash.com/photo-1565891741441-6ad9652bb790?auto=format&fit=crop&q=80&w=800" 
            />
            <GalleryTile 
              title="Showroom" 
              icon={<Maximize2 size={16}/>} 
              delay={0.2} 
              img="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" 
            />
          </div>

          {/* TECHNICAL DEEP DIVE BANNER */}
          <div className="md:col-span-2 md:row-span-1 relative rounded-[40px] overflow-hidden group border border-[#bc9848]/20 bg-white/5 backdrop-blur-xl flex items-center px-10 gap-8">
             <div className="flex-1">
                <h4 className="text-xl font-bold mb-2 text-white">Technical Deep Dive</h4>
                <p className="text-sm text-gray-400 mb-4 italic">Watch our engineers explain the precision of our proprietary CNC technology.</p>
                <button className="flex items-center gap-2 text-xs font-black uppercase text-[#bc9848] hover:gap-4 transition-all tracking-widest">
                  Watch Full Video <ChevronRight size={14} />
                </button>
             </div>
             <div className="hidden sm:flex w-32 h-32 rounded-3xl bg-black border border-[#bc9848]/20 items-center justify-center relative overflow-hidden group-hover:border-[#bc9848] transition-all">
                <Video size={32} className="text-[#6a4e0a] group-hover:text-[#bc9848] transition-colors" />
                <div className="absolute inset-0 bg-linear-to-br from-[#bc9848]/10 to-transparent" />
             </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// Helper Component for Grid Tiles
const GalleryTile = ({ title, icon, delay, img }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="relative h-full rounded-4xl overflow-hidden border border-[#bc9848]/10 group cursor-pointer"
  >
    <motion.div 
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${img})` }}
    />
    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all" />
    <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">
      <div className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-[#bc9848]/30 text-[#bc9848]">
        {icon}
      </div>
      <span className="text-xs font-bold tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        {title}
      </span>
    </div>
  </motion.div>
);

export default MediaGallery;