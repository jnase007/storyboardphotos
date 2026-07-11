// Book viewer pages get a clean fullscreen layout — no navbar or promo bar
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
