 "use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck, Zap, MapPin, ShieldCheck,
  ChevronDown, Globe, Menu, Search
} from 'lucide-react';
import Link from 'next/link';

const CompanyHeaderWithNav = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/', hasDropdown: true },
    { name: 'Business Details', href: '/business' },
    { name: 'Trust and Certifications', href: '/trust' },
    { name: 'Media Gallery', href: '/gallery' },
    { name: 'R&D Center', href: '/customization' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="relative w-full bg-black text-white overflow-hidden border-b border-[#bc9848]/20">

      {/* 1. TOP IDENTITY AREA */}
      <div className="relative w-full min-h-65 flex items-center px-6 lg:px-16 py-12">
        {/* Animated Background Reflection */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-full bg-linear-to-r from-transparent via-[#bc9848]/5 to-transparent skew-x-[-25deg] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">

          {/* Left: Identity Section */}
          <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            <motion.div whileHover={{ scale: 1.02 }} className="relative group">
              {/* Logo Container - بجای آیکون سپر حالا تصویر قرار می‌گیرد */}
              <div className="w-40 h-40 rounded-[28px] bg-white/5 backdrop-blur-xl border border-[#bc9848]/20 shadow-2xl flex items-center justify-center p-4 transition-all duration-500 group-hover:border-[#bc9848]/50">
                <div className="w-full h-full bg-linear-to-br from-[#bc9848]/10 to-transparent rounded-2xl flex items-center justify-center overflow-hidden">
                  {/* درج لوگوی ارسالی - آدرس تصویر را جایگزین کنید */}
                  <img
                    src="/logo.png"
                    alt="Globenter Logo"
                    className="w-full h-full object-contain p-2 filter brightness-110 group-hover:brightness-125 transition-all duration-500"
                  />
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col text-center md:text-left justify-center h-full pt-4">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-4xl font-bold tracking-tight text-white uppercase">
                  GLOBENTER <span className="text-[#bc9848] font-light">|</span> <span className="text-[#bc9848] font-medium text-2xl">MARKET</span>
                </h1>
                <div className="bg-[#bc9848] p-1 rounded-full shadow-[0_0_15px_rgba(188,152,72,0.3)]">
                  <BadgeCheck className="w-5 h-5 text-black" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge text="Manufacturer" />
                <div className="w-1 h-1 bg-[#6a4e0a] rounded-full" />
                <Badge text="Since 2008" />
                <div className="w-1 h-1 bg-[#6a4e0a] rounded-full" />
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-[#bc9848]/20 rounded-full text-[10px] font-bold text-[#bc9848] tracking-widest uppercase">
                  <MapPin size={12} /> Kabul, Afghanistan
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats/Actions */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-[#bc9848]/10">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#6a4e0a]" />
                <span className="text-sm font-medium text-gray-400">Global Exports</span>
              </div>
              <span className="text-sm font-bold text-[#bc9848]">32+ Countries</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#6a4e0a" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#bc9848] text-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#6a4e0a]/20"
            >
              <Zap size={18} fill="currentColor" /> QUICK CONTACT
            </motion.button>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM NAVBAR AREA */}
      <nav className="w-full border-t border-[#bc9848]/20 bg-black/50 backdrop-blur-md px-6 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

          {/* Main Links */}
          <ul className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => (
              <li key={link.name} className="h-full relative group">
                <Link
                  href={link.href}
                  onClick={() => setActiveTab(link.name)}
                  className={`flex items-center gap-1.5 text-sm font-bold h-full transition-colors uppercase tracking-wider ${activeTab === link.name ? 'text-[#bc9848]' : 'text-gray-400 hover:text-[#bc9848]'
                    }`}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />}
                </Link>
                {activeTab === link.name && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#bc9848]"
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <Menu size={24} className="text-[#bc9848]" />
          </div>

          {/* Nav Right: Search & Language */}
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a4e0a]" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white/5 border border-[#bc9848]/20 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#bc9848] w-48 transition-all placeholder:text-gray-600 text-white"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#bc9848] cursor-pointer hover:text-white transition-colors">
              <Globe size={14} />
              EN
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
};

const Badge = ({ text }: { text: string }) => (
  <span className="px-4 py-1.5 bg-white/5 border border-[#bc9848]/20 rounded-full text-[10px] font-bold text-gray-300 tracking-widest uppercase">
    {text}
  </span>
);

export default CompanyHeaderWithNav;