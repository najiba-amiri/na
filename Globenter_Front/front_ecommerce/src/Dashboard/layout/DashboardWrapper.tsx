"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";

import AppHeader from "@/Dashboard/layout/AppHeader";
import AppSidebar from "@/Dashboard/layout/AppSidebar";
import Backdrop from "@/Dashboard/layout/Backdrop";
import { SidebarProvider, useSidebar } from "@/Dashboard/context/SidebarContext";
import { Toaster } from "react-hot-toast";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <SidebarContent>{children}</SidebarContent>
      </SidebarProvider>
    </Provider>
  );
}

// Separate component to consume sidebar state
function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex rtl light-mode">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">{children}</div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
