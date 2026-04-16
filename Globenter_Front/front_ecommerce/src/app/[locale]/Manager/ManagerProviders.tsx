"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import DashboardWrapper from "@/Dashboard/layout/DashboardWrapper";

interface ManagerProvidersProps {
  children: React.ReactNode;
  locale: string;
}

export default function ManagerProviders({ children, locale }: ManagerProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <Provider store={store}>
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
      </Provider>
    </NextIntlClientProvider>
  );
}
