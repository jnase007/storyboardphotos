"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const TOOLS = [
  {
    href: "/business-plan",
    title: "Business Plan",
    description:
      "Internal plan, projections, operations, and growth roadmap for Storybook Photos.",
    icon: ClipboardList,
    badge: "Internal",
  },
  {
    href: "/business-plan/print",
    title: "Business Plan (Print / PDF)",
    description:
      "Print-friendly multi-page version for sharing or saving as a PDF.",
    icon: Printer,
    badge: "Print",
  },
  {
    href: "/admin/books",
    title: "Books Library",
    description: "View all generated storybooks — preview, share links, download PDFs, delete.",
    icon: BookOpen,
    badge: "New",
  },
  {
    href: "/admin/storybook-generator",
    title: "Storybook Generator",
    description:
      "Upload session photos, generate personalized kingdom stories & illustrations, edit, and export a printer PDF.",
    icon: Sparkles,
    badge: "AI Tool",
  },
  {
    href: "/admin/story-scripts",
    title: "Story Scripts",
    description:
      "Review and edit the Princess (girl) and Prince (boy) Kingdom Quest scripts — separate from the public Storybooks page.",
    icon: BookOpen,
    badge: "Admin",
  },
] as const;

/**
 * Password-gated staff hub linking internal tools.
 */
export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-enchanted-cream">
      <div className="bg-royal-blue border-b border-royal-gold/30">
        <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-12">
          <p className="text-royal-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Staff only · Code 3121
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-cream mb-3">
            Admin Dashboard
          </h1>
          <p className="text-royal-cream/65 text-sm sm:text-base max-w-xl leading-relaxed">
            Internal tools for Storybook Photos — business planning, story
            scripts, and the AI storybook generator.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-14 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-5">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={tool.href}
                className="group flex flex-col h-full rounded-2xl border-2 border-royal-gold/30 bg-white p-6 sm:p-7 shadow-md shadow-royal-gold/5 hover:border-royal-gold hover:shadow-lg hover:shadow-royal-gold/15 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-royal-blue/5 ring-1 ring-royal-gold/30 group-hover:bg-royal-gold/15 transition-colors">
                    <tool.icon className="h-5 w-5 text-royal-gold" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-royal-gold bg-royal-gold/10 px-2 py-1 rounded-md">
                    {tool.badge}
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-royal-blue mb-2 group-hover:text-royal-blue">
                  {tool.title}
                </h2>
                <p className="text-sm text-royal-blue/60 leading-relaxed flex-1 mb-4">
                  {tool.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal-gold">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-royal-blue/40 flex items-center justify-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          Add FAL_API_KEY, GROK_API_KEY, and Supabase keys in Vercel for full AI
          generation.
        </p>
      </div>
    </div>
  );
}
