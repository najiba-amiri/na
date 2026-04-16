import React from "react";
import type { Metadata } from "next";
import { EcommerceMetrics } from "@/Dashboard/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/Dashboard/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/Dashboard/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/Dashboard/components/ecommerce/RecentOrders";
import DemographicCard from "@/Dashboard/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>






{/*       
{/*        
      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>


      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */} 
    </div>
  );
}
