import React from "react";
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 bg-muted/30 gap-6">
      <div className="text-7xl">Kalender Hub</div>

          <Link href="/" className="shadow-sm text-2xl rounded-full px-4 py-2 text-primary border border-primary">Mulai</Link>

    </div>
  );
}
