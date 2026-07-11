import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing use of the ${SITE.name} website and photography services.`,
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <LegalPage title="Terms of Service" updated="July 9, 2026">
        <LegalSection title="1. Agreement">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of{" "}
            {SITE.domain} and the photography, storybook, and related services
            offered by {SITE.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;). By using our website or booking a session, you
            agree to these Terms and our{" "}
            <Link href="/privacy" className="text-royal-gold hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            If you book on behalf of a child, you represent that you are the
            parent or legal guardian (or have authority to book) and can agree
            to these Terms for that session.
          </p>
        </LegalSection>

        <LegalSection title="2. Services">
          <p>
            We provide immersive studio photography sessions, digital and print
            products, and Kingdom Chronicless as described on our website.
            Package details, pricing, and inclusions may change; the description
            at the time of booking controls unless we agree otherwise in writing.
          </p>
        </LegalSection>

        <LegalSection title="3. Bookings, Deposits & Payment">
          <p>
            Submitting a booking request does not guarantee a date until we
            confirm it. A deposit or payment may be required to reserve your
            session. Remaining balances are due as communicated at booking or
            before delivery of products. Fees are generally non-refundable except
            as required by law or as we expressly agree in writing (for example,
            if we cancel and cannot reschedule).
          </p>
        </LegalSection>

        <LegalSection title="4. Cancellations & Rescheduling">
          <p>
            Please contact us as soon as possible if you need to change your
            session. Rescheduling is subject to availability. Late cancellations
            or no-shows may result in forfeiture of deposits. We may reschedule
            for illness, emergencies, studio issues, or circumstances beyond our
            reasonable control.
          </p>
        </LegalSection>

        <LegalSection title="5. Studio Conduct & Safety">
          <p>
            Parents/guardians are responsible for supervising children during
            the visit. Costumes, props, and sets must be used as directed. We may
            pause or end a session if safety or respectful conduct is at risk.
            Please arrive on time; late arrivals may shorten the session.
          </p>
        </LegalSection>

        <LegalSection title="6. Photos, Storybooks & Intellectual Property">
          <p>
            We retain copyright in the photographs, illustrations, designs, and
            storybook layouts we create, unless a written agreement says
            otherwise. When you purchase products, you receive a personal,
            non-commercial license to enjoy and share your images for personal
            use (including social media with credit appreciated). You may not
            sell, license, or commercially exploit the images or storybooks
            without our prior written consent.
          </p>
          <p>
            We may use session images for portfolio, website, and marketing only
            with parent/guardian permission. You may decline marketing use; it
            will not affect delivery of your purchased products.
          </p>
        </LegalSection>

        <LegalSection title="7. Client Content & Accuracy">
          <p>
            Information you provide (names, story preferences, special requests)
            should be accurate. Personalized storybooks and products depend on
            the details you submit; please review proofs or confirmations when
            offered. Minor creative interpretation is part of the artistic
            process.
          </p>
        </LegalSection>

        <LegalSection title="8. Website Use">
          <p>
            You agree not to misuse the site (including attempting unauthorized
            access, scraping, or interfering with operations). Site content —
            text, branding, and media — is owned by us or our licensors and may
            not be copied for commercial use without permission.
          </p>
        </LegalSection>

        <LegalSection title="9. Disclaimers">
          <p>
            Sessions are creative experiences; results vary based on lighting,
            cooperation, timing, and other factors. We strive for excellence but
            do not guarantee specific poses, expressions, or outcomes. The site
            and services are provided &ldquo;as is&rdquo; to the fullest extent
            permitted by law.
          </p>
        </LegalSection>

        <LegalSection title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, {SITE.name} and its owners,
            employees, and contractors are not liable for indirect, incidental,
            special, consequential, or punitive damages, or for loss of profits,
            data, or goodwill, arising from your use of the site or services. Our
            total liability for any claim related to a session or order is
            limited to the amount you paid us for that session or order.
          </p>
        </LegalSection>

        <LegalSection title="11. Indemnity">
          <p>
            You agree to indemnify and hold us harmless from claims arising out
            of your breach of these Terms, misuse of the site or products, or
            disputes related to authority to book or consent for a minor, except
            to the extent caused by our willful misconduct.
          </p>
        </LegalSection>

        <LegalSection title="12. Governing Law">
          <p>
            These Terms are governed by the laws of the State of California,
            without regard to conflict-of-law rules. Disputes will be resolved in
            the state or federal courts located in Orange County, California,
            unless applicable law requires otherwise.
          </p>
        </LegalSection>

        <LegalSection title="13. Changes">
          <p>
            We may update these Terms periodically. The &ldquo;Last
            updated&rdquo; date will change when we do. Continued use of the
            site or services after changes constitutes acceptance of the revised
            Terms.
          </p>
        </LegalSection>

        <LegalSection title="14. Contact">
          <p>
            {SITE.name}
            <br />
            {SITE.address}
            <br />
            <a
              href={`mailto:${SITE.email}`}
              className="text-royal-gold hover:underline"
            >
              {SITE.email}
            </a>
            <br />
            {SITE.phone}
          </p>
        </LegalSection>
      </LegalPage>
    </PageShell>
  );
}
