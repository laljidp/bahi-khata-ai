"use client";
import Dashboard from "../Dashboard";
import { useAppFrame } from "../AppFrame";

export default function DashboardRoute() {
  const { dashboard, openCustomer } = useAppFrame();
  return <Dashboard dashboard={dashboard} onOpenCustomer={openCustomer} />;
}
