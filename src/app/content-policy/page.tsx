/** Content Policy — referenced from landing footer + Terms. */

import LegalLayout, { H2, P, UL } from "../_legal/Layout";

export const metadata = {
  title: "Content Policy — PetDate",
  description: "Rules for what you can post on PetDate.",
};

export default function ContentPolicy() {
  return (
    <LegalLayout title="Content Policy" updated="2026-06-14">
      <P>
        PetDate is a place for pet owners to meet neighbors and plan walks.
        These rules apply to every photo, message, and bit of profile text you
        share.
      </P>

      <H2>What's allowed</H2>
      <UL>
        <li>Clear photos of you and your pet.</li>
        <li>Friendly, respectful conversation.</li>
        <li>Genuine information about your pet's personality and yours.</li>
      </UL>

      <H2>What's not allowed</H2>
      <UL>
        <li>Nudity, sexual content, or sexual solicitation.</li>
        <li>Hate speech, harassment, threats, or doxxing.</li>
        <li>
          Photos of minors as primary subjects, or any content that puts a
          minor at risk.
        </li>
        <li>Animal cruelty or content that glorifies it.</li>
        <li>Selling pets, breeding ads, or commercial solicitation.</li>
        <li>
          Drugs, weapons, financial scams, MLM/crypto promotion, or stolen
          content.
        </li>
        <li>Impersonating others or using fake identities.</li>
        <li>Spam, repetitive messages, or off-platform redirection.</li>
      </UL>

      <H2>Photo guidelines</H2>
      <UL>
        <li>Your first photo should clearly show your face or your pet's.</li>
        <li>No stock photos, memes, or photos you don't have rights to.</li>
        <li>
          We may remove photos that are inappropriate, misleading, or violate
          these guidelines.
        </li>
      </UL>

      <H2>Safety</H2>
      <UL>
        <li>
          Block and report features are in every profile and chat. Use them.
        </li>
        <li>
          We review reports and may suspend or remove accounts that violate
          this Policy.
        </li>
        <li>
          For safety in person: meet in public places, tell a friend where
          you're going, and trust your instincts.
        </li>
      </UL>

      <H2>Enforcement</H2>
      <P>
        Violations may result in content removal, temporary suspension, or
        permanent account termination depending on severity. Serious or
        repeated violations are escalated immediately.
      </P>

      <H2>Report something</H2>
      <P>
        Tap the flag icon in any profile or chat, or email
        son7523589@gmail.com with details and screenshots.
      </P>
    </LegalLayout>
  );
}
