"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Tag,
  Users,
  LogOut,
  Loader2,
  Star,
  ExternalLink,
  Menu,
  TreePine,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/materials", label: "Materials", icon: TreePine },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/users", label: "Users", icon: Users },
];

function SidebarNav({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border-subtle px-6 py-5">
        <span className="font-serif-display text-xl">MAISON</span>
        <span className="rounded-full bg-walnut/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-walnut">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-walnut text-white" : "text-foreground/70 hover:bg-surface-muted"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-subtle p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-surface-muted"
        >
          <ExternalLink size={17} />
          View storefront
        </Link>
        <button
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/70 hover:bg-surface-muted"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, user, hasHydrated } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken || user?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [hasHydrated, accessToken, user, router]);

  if (!hasHydrated || !accessToken || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <Loader2 className="animate-spin text-foreground/40" size={28} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border-subtle bg-surface md:flex">
        <SidebarNav pathname={pathname} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-4 md:hidden">
          <Button variant="ghost" size="icon-sm" onClick={() => setMobileNavOpen(true)}>
            <Menu size={20} />
          </Button>
          <span className="font-serif-display text-lg">MAISON Admin</span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
