"use client";
import CustomerDetail from "../CustomerDetail";
import { useRouter } from "next/navigation";
import { useAppFrame } from "../AppFrame";

export default function CustomerDetailRoute() {
  const router = useRouter();
  const { currentCustomer, openEditCustomer, openEntry, deleteEntry } =
    useAppFrame();
  if (!currentCustomer)
    return (
      <div className="py-10 text-center text-sm text-inkSoft">
        Loading customer...
      </div>
    );
  return (
    <CustomerDetail
      customer={currentCustomer}
      onBack={() => router.push("/customers")}
      onEditCustomer={() => openEditCustomer(currentCustomer)}
      onAddCredit={() => openEntry("credit")}
      onAddPayment={() => openEntry("payment")}
      onEditEntry={(entry) => openEntry(entry.type, entry)}
      onDeleteEntry={deleteEntry}
    />
  );
}
