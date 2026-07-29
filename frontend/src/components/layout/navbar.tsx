"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { MEGA_MENU } from "@/lib/nav-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { useCartCount } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const cartCount = useCartCount();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart = useUiStore((s) => s.openCart);
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-border-subtle bg-background/90 backdrop-blur-md" : "border-transparent bg-background"
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="hidden bg-walnut text-white md:block">
        <div className="container-page flex items-center justify-end gap-6 py-1.5 text-xs font-medium">
          <Link href="#" className="hover:underline">Gift Cards</Link>
          <Link href="/account" className="hover:underline">Track Order</Link>
          <Link href="#" className="hover:underline">Help</Link>
        </div>
      </div>

      <div className="container-page flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <button
            className="p-1 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="font-serif-display text-2xl tracking-wide">
            MAISON
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {MEGA_MENU.map((cat) => (
              <div key={cat.slug} onMouseEnter={() => setActiveMenu(cat.slug)}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={cn(
                    "block px-4 py-2 text-sm tracking-wide transition-colors hover:text-walnut",
                    activeMenu === cat.slug && "text-walnut"
                  )}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
            <Link
              href="/wood-ply-catalogue"
              className="block px-4 py-2 text-sm tracking-wide transition-colors hover:text-walnut"
            >
              Material Lookbook
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Search size={18} />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-walnut text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label={accessToken ? "My Account" : "Log In"}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <User size={18} />
          </Link>
          <button
            aria-label="Cart"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-walnut text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
              <Search size={18} className="text-foreground/50" />
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search sofas, dining tables, decor…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-foreground/40"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mega menu */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-b border-border-subtle bg-surface shadow-lg md:block"
          >
            {MEGA_MENU.filter((c) => c.slug === activeMenu).map((cat) => (
              <div key={cat.slug} className="container-page grid grid-cols-4 gap-10 py-10">
                <div className="col-span-1 overflow-hidden rounded-xl">
                  <div className="relative h-full min-h-[220px] w-full">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-5">
                      <Link href={`/products?category=${cat.slug}`} className="text-sm font-medium text-white underline underline-offset-4">
                        Shop {cat.name}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-8">
                  {cat.columns.map((col) => (
                    <div key={col.heading}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                        {col.heading}
                      </h3>
                      <ul className="space-y-2">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link href={link.href} className="text-sm hover:text-walnut">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-surface p-6 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-serif-display text-xl">MAISON</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <ul className="space-y-1">
                {MEGA_MENU.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm hover:bg-surface-muted"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-walnut"
                  >
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wood-ply-catalogue"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm hover:bg-surface-muted"
                  >
                    Material Lookbook
                  </Link>
                </li>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </header>
  );
}
