import Link from "next/link";
import { Crown, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { SITE, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative bg-enchanted-night border-t border-royal-gold/20 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal-gold/50 to-transparent"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-royal-gold" />
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-lg font-bold text-royal-cream">
                  {SITE.name}
                </span>
                <span className="text-xs text-royal-gold tracking-widest uppercase">
                  {SITE.subtitle}
                </span>
              </div>
            </Link>
            <p className="text-royal-cream/50 text-sm leading-relaxed mb-4">
              {SITE.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-royal-gold/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-royal-cream/70" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-royal-gold/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-royal-cream/70" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-royal-cream mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-royal-cream/50 hover:text-royal-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-royal-cream mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 text-royal-cream/50 hover:text-royal-gold text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-2 text-royal-cream/50 hover:text-royal-gold text-sm transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-royal-cream/50 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {SITE.address}
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-serif font-bold text-royal-cream mb-4">
              Ready to Begin?
            </h4>
            <p className="text-royal-cream/50 text-sm mb-4">
              Limited sessions available each month. Give your child a kingdom
              adventure they&apos;ll never forget.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-6 py-3 bg-royal-gold text-royal-blue font-semibold rounded-md hover:bg-[#D4B480] transition-colors text-sm"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 pb-28 sm:pb-8 border-t border-royal-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-royal-cream/40 text-sm">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link
              href="/privacy"
              className="inline-flex min-h-10 items-center text-royal-cream/40 hover:text-royal-gold transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-10 items-center text-royal-cream/40 hover:text-royal-gold transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center text-royal-cream/40 hover:text-royal-gold transition-colors"
            >
              Admin
            </Link>
            <span className="text-royal-cream/40">{SITE.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
