import Link from "next/link";
import { Instagram, Facebook, Twitter } from "@/components/icons/social-icons";
import { MEGA_MENU } from "@/lib/nav-data";

const PAYMENT_METHODS = ["Visa", "Mastercard", "AMEX", "RuPay", "UPI", "Maestro"];

export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-walnut bg-surface">
      <div className="container-page grid grid-cols-2 gap-10 py-14 md:grid-cols-6">
        <div className="col-span-2">
          <span className="text-2xl font-extrabold tracking-tight">MAISON</span>
          <p className="mt-4 max-w-xs text-sm text-foreground/60">
            Buy furniture online at the best prices — sofas, beds, dining and decor delivered across India.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-foreground/60 hover:bg-walnut hover:text-white">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-foreground/60 hover:bg-walnut hover:text-white">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-foreground/60 hover:bg-walnut hover:text-white">
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {MEGA_MENU.slice(0, 3).map((cat) => (
          <div key={cat.slug}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground/50">
              {cat.name}
            </h3>
            <ul className="space-y-2">
              {cat.columns[0].links.slice(0, 3).map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-foreground/70 hover:text-walnut">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground/50">Customer Service</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-foreground/70 hover:text-walnut">Track Order</Link></li>
            <li><Link href="#" className="text-sm text-foreground/70 hover:text-walnut">Shipping & Delivery</Link></li>
            <li><Link href="#" className="text-sm text-foreground/70 hover:text-walnut">Help Center</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle py-6">
        <div className="container-page flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-foreground/50">© {new Date().getFullYear()} Maison Furniture Co. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span key={m} className="rounded border border-border-subtle bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-foreground/60">
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-5 text-xs text-foreground/50">
            <Link href="#" className="hover:text-walnut">Privacy Policy</Link>
            <Link href="#" className="hover:text-walnut">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
