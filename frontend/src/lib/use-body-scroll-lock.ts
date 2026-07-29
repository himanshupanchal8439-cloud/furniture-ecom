import { useEffect } from "react";

/**
 * Locks background scroll while a fixed-position overlay (drawer/modal) is open.
 * Without this, mobile browsers let the page behind a `fixed` overlay keep
 * scrolling, which visually interleaves the overlay with the page underneath.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isLocked]);
}
