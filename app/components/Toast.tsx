"use client";

export default function Toast({ message }: { message: string | null }) {
  return (
    <div
      className={`fixed left-1/2 bottom-[calc(90px+env(safe-area-inset-bottom))] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-opacity duration-200 z-[200] ${
        message ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
}
