import { useCallback, useEffect, useState } from "react";

const WISHLIST_KEY = "rental_wishlist";

const readWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(readWishlist);

  useEffect(() => {
    const sync = () => setWishlist(readWishlist());
    window.addEventListener("wishlist-changed", sync);
    return () => window.removeEventListener("wishlist-changed", sync);
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((vehicleId) => vehicleId !== id)
        : [...prev, id];
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode etc.) — stay in-memory only.
      }
      window.dispatchEvent(new Event("wishlist-changed"));
      return next;
    });
  }, []);

  return {
    wishlist,
    isWishlisted: (id) => wishlist.includes(id),
    toggleWishlist,
    count: wishlist.length,
  };
};