/** Terms of Service. Linked from login agreement + landing footer. */

import LegalLayout, { H2, P, UL } from "../_legal/Layout";

export const metadata = {
  title: "Terms of Service — PetDate",
  description: "The rules for using the PetDate Service.",
};

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="2026-06-14">
      <P>
        Welcome to PetDate. These Terms of Service ("Terms") govern your use
        of the PetDate mobile and web app (the "Service"). By creating an
        account or using the Service you agree to these Terms.
      </P>

      <H2>1. Eligibility</H2>
      <UL>
        <li>You must be 18 years or older to use the Service.</li>
        <li>You must register with an accurate email address.</li>
        <li>One account per person.</li>
      </UL>

      <H2>2. Your account</H2>
      <UL>
        <li>You're responsible for activity on your account.</li>
        <li>
          Use a strong password and don't share it. Tell us right away if you
          suspect unauthorized use.
        </li>
        <li>
          We may suspend or terminate accounts that violate these Terms or
          harm other users.
        </li>
      </UL>

      <H2>3. Acceptable use</H2>
      <P>You will not:</P>
      <UL>
        <li>Impersonate others or create misleading profiles.</li>
        <li>Post content that's illegal, abusive, harassing, or sexual.</li>
        <li>Sell, scam, advertise, or solicit money from other users.</li>
        <li>
          Scrape, reverse-engineer, or interfere with the Service's operation.
        </li>
        <li>
          Upload photos you don't have the right to use, or photos that depict
          minors as primary subjects.
        </li>
      </UL>
      <P>
        Specific content rules are in our{" "}
        <a href="/content-policy" style={{ color: "var(--brand-strong)" }}>
          Content Policy
        </a>
        .
      </P>

      <H2>4. Subscriptions and billing</H2>
      <UL>
        <li>
          Premium subscriptions auto-renew at the end of each billing period.
        </li>
        <li>
          Cancel any time from Settings. Cancellation takes effect at the end
          of the current period.
        </li>
        <li>
          Refunds are not provided for partial periods unless required by law.
        </li>
        <li>
          We may change prices with at least 30 days notice for existing
          subscribers.
        </li>
      </UL>

      <H2>5. Content ownership</H2>
      <P>
        You own the photos and text you upload. By uploading you grant PetDate
        a worldwide, royalty-free license to host, display, and distribute
        them as needed to operate the Service. You can delete your content at
        any time and the license ends, except where the law requires us to
        retain a copy.
      </P>

      <H2>6. Disclaimers</H2>
      <P>
        The Service is provided "as is". We do not guarantee matches, that
        other users are who they claim to be, or that the Service will be
        uninterrupted. Meeting other users in person is your decision and at
        your risk; we strongly recommend meeting in public places.
      </P>

      <H2>7. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, PetDate is not liable for any
        indirect, incidental, special, consequential, or punitive damages
        arising out of your use of the Service.
      </P>

      <H2>8. Termination</H2>
      <P>
        You may delete your account in Settings → Account → Delete account.
        Deletion is permanent and removes your profile, pets, and chat
        history. We may also terminate or suspend access for Terms violations.
      </P>

      <H2>9. Changes</H2>
      <P>
        We may update these Terms. Material changes will be communicated in
        the app at least 14 days before they take effect.
      </P>

      <H2>10. Contact</H2>
      <P>Questions or notices: son7523589@gmail.com.</P>
    </LegalLayout>
  );
}
