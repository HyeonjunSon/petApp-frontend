/** Privacy Policy — required by App Store / Google Play before launch. */

import LegalLayout, { H2, P, UL } from "../_legal/Layout";

export const metadata = {
  title: "Privacy Policy — PetDate",
  description: "How PetDate collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="2026-06-14">
      <P>
        This Privacy Policy describes how PetDate ("we", "our") collects,
        uses, and shares your information when you use the PetDate mobile or
        web app (the "Service"). By using the Service you agree to this
        Policy.
      </P>

      <H2>1. Information we collect</H2>
      <P>We collect the following categories of information.</P>
      <UL>
        <li>
          <b>Account info</b>: email address, password (stored hashed), display
          name, and email-verification codes.
        </li>
        <li>
          <b>Profile info</b>: your photo, your pet's photos and details (name,
          breed, age, sex, size, personality), neighborhood, and interests you
          choose to share.
        </li>
        <li>
          <b>Activity</b>: who you like, pass, match with, and the messages you
          send within the Service.
        </li>
        <li>
          <b>Device & sensor data</b>: daily step counts read from your phone's
          pedometer (with permission), approximate location when you opt in.
        </li>
        <li>
          <b>Technical</b>: IP address, device type, OS version, app version,
          and crash logs.
        </li>
      </UL>

      <H2>2. How we use it</H2>
      <UL>
        <li>Show you nearby pet owners and let you start conversations.</li>
        <li>
          Power walk planning, step tracking, and feature personalization.
        </li>
        <li>Authenticate you and keep your account secure.</li>
        <li>Prevent fraud, spam, and abuse.</li>
        <li>Comply with legal obligations.</li>
      </UL>

      <H2>3. Photos and Cloudinary</H2>
      <P>
        Profile and pet photos are uploaded to Cloudinary, our image hosting
        partner. Cloudinary processes uploads on our behalf under a data
        processing agreement. You can delete a photo from the Service at any
        time; the deletion is reflected in Cloudinary within a short window.
      </P>

      <H2>4. Email</H2>
      <P>
        We send verification codes, password reset codes, and (optionally)
        notification emails via Gmail SMTP. Marketing emails, if any, are
        opt-in and unsubscribable.
      </P>

      <H2>5. Sharing</H2>
      <P>
        We do not sell your personal information. We share data only with:
      </P>
      <UL>
        <li>Service providers (hosting, image processing, email, analytics).</li>
        <li>
          Other users — only the parts of your profile you choose to make
          discoverable.
        </li>
        <li>Authorities, when required by law or to protect users.</li>
      </UL>

      <H2>6. Your rights</H2>
      <UL>
        <li>Access, update, or delete your account at any time in Settings.</li>
        <li>Withdraw consent for location and motion data via OS permissions.</li>
        <li>
          Request a copy of your data by emailing son7523589@gmail.com.
        </li>
      </UL>

      <H2>7. Children</H2>
      <P>
        PetDate is not directed to children under 13. We do not knowingly
        collect data from anyone under 13. If you believe a minor has provided
        us data, contact us and we will delete it.
      </P>

      <H2>8. Security</H2>
      <P>
        We use HTTPS, password hashing, and access controls to protect your
        data. No system is 100% secure; we encourage strong unique passwords
        and email verification.
      </P>

      <H2>9. Changes</H2>
      <P>
        We may update this Policy. Material changes will be communicated in
        the app at least 14 days before they take effect.
      </P>

      <H2>10. Contact</H2>
      <P>Questions or requests: son7523589@gmail.com.</P>
    </LegalLayout>
  );
}
