"use client";
import CustomersList from "../CustomersList";
import { useAppFrame } from "../AppFrame";

export default function CustomersRoute() {
  const { customers, openCustomer } = useAppFrame();
  return <CustomersList customers={customers} onOpen={openCustomer} />;
}
