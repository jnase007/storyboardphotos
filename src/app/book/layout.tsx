// Only used by /book and /book/[id] tree.
// Viewer chrome is stripped in SiteChrome for /book/[id] only.
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
