import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects your personal information.`,
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <LegalPage title="Privacy Policy" updated="July 9, 2026">
        <LegalSection title="1. Who We Are">
          <p>
            {SITE.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            operates the website {SITE.domain} and provides faith-centered
            photography sessions and Kingdom Chronicless from our studio at{" "}
            {SITE.address}.
          </p>
          <p>
            Questions about this policy:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-royal-gold hover:underline"
            >
              {SITE.email}
            </a>{" "}
            or {SITE.phone}.
          </p>
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          <p>We may collect:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Contact & booking details</strong> — name, email, phone,
              preferred session date, package selection, and messages you submit
              through our booking or contact forms.
            </li>
            <li>
              <strong>Child & session details</strong> — information you choose
              to share to help us curate the experience (e.g., child&apos;s
              first name, age range, story preferences, and notes you provide).
              We ask parents/guardians to share only what is needed for the
              session.
            </li>
            <li>
              <strong>Photos & creative work</strong> — images and storybook
              content created during your session, as described in our{" "}
              <Link href="/terms" className="text-royal-gold hover:underline">
                Terms of Service
              </Link>
              .
            </li>
            <li>
              <strong>Technical data</strong> — IP address, browser type, device
              information, and pages visited, collected through cookies and
              similar technologies when you use our site.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. How We Use Your Information">
          <p>We use personal information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Respond to inquiries and schedule sessions</li>
            <li>Prepare and deliver your portraits and storybooks</li>
            <li>Communicate about bookings, products, and studio updates</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations and protect our rights</li>
          </ul>
          <p>
            We do not sell your personal information. We do not use children&apos;s
            photos for marketing without a parent or guardian&apos;s permission.
          </p>
        </LegalSection>

        <LegalSection title="4. Cookies & Similar Technologies">
          <p>
            We use cookies and similar technologies to operate the site, remember
            preferences (including cookie consent), and understand how visitors
            use our pages. You can manage cookies through your browser settings
            and through our cookie banner. Essential cookies may be required for
            basic site function. See our cookie notice on the site for choices
            available to you.
          </p>
        </LegalSection>

        <LegalSection title="5. Sharing of Information">
          <p>
            We may share information with service providers who help us run the
            business (for example hosting, email, booking storage, or payment
            processors), only as needed to provide services. We may also disclose
            information if required by law or to protect safety, rights, or
            property.
          </p>
        </LegalSection>

        <LegalSection title="6. Photos of Minors">
          <p>
            Sessions often involve children. By booking, the parent or legal
            guardian confirms they have authority to provide information about
            the child and to consent to photography. We handle images with care
            and store them securely with our production partners as needed to
            deliver your order.
          </p>
        </LegalSection>

        <LegalSection title="7. Data Retention">
          <p>
            We retain booking and contact information as long as needed for
            sessions, orders, customer service, and legal or accounting
            requirements. Session images may be retained for a reasonable period
            to fulfill reorders and quality support, unless you request earlier
            deletion where applicable.
          </p>
        </LegalSection>

        <LegalSection title="8. Your Choices & Rights">
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or limit use of your personal information, or to opt out of
            certain processing. To make a request, email{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-royal-gold hover:underline"
            >
              {SITE.email}
            </a>
            . We will respond as required by applicable law. You may also
            unsubscribe from marketing emails using the link in those messages.
          </p>
        </LegalSection>

        <LegalSection title="9. Security">
          <p>
            We use reasonable administrative, technical, and organizational
            measures to protect personal information. No method of transmission
            or storage is completely secure; please use strong passwords and
            contact us if you suspect unauthorized access related to your
            account or order.
          </p>
        </LegalSection>

        <LegalSection title="10. Third-Party Links">
          <p>
            Our site may link to third-party websites (for example social media).
            We are not responsible for their privacy practices. Review their
            policies before sharing information with them.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes">
          <p>
            We may update this Privacy Policy from time to time. The &ldquo;Last
            updated&rdquo; date at the top will change when we do. Continued use
            of the site after changes means you acknowledge the updated policy.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact">
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
