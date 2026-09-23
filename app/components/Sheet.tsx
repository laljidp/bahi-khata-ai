"use client";

export default function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-paper p-5 pb-[calc(22px+env(safe-area-inset-bottom))] sm:rounded-2xl sm:p-6">
        {children}
      </div>
    </div>
  );
}
