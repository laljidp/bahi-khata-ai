"use client";

import RecentActivity from "../RecentActivity";
import { useAppFrame } from "../AppFrame";

export default function ActivityRoute() {
  const { openCustomer } = useAppFrame();
  return <RecentActivity onOpenCustomer={openCustomer} />;
}
