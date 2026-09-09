import type { Metadata } from "next";
import { PasswordGate } from "@/components/password-gate";
import { KioskApp } from "@/components/kiosk/kiosk-app";

export const metadata: Metadata = {
  title: "Adventure Kiosk",
  description:
    "In-studio touchscreen kiosk — choose your Storybook Photos adventure.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function KioskPage() {
  return (
    <PasswordGate
      code="3121"
      storageKey="sbp-unlock-kiosk"
      title="Adventure Kiosk"
      description="Staff only — enter the PIN to unlock the in-studio choose-your-adventure kiosk."
      buttonLabel="Unlock Kiosk"
    >
      <KioskApp />
    </PasswordGate>
  );
}
