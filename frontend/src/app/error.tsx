"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center md:py-32">
      <h1 className="font-serif-display text-2xl md:text-3xl">Something Went Wrong</h1>
      <p className="max-w-md text-sm text-foreground/60">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <button onClick={() => reset()} className="mt-2 rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
        Try Again
      </button>
    </div>
  );
}
