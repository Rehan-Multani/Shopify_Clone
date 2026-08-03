import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout';

const TermsAndConditions = () => (
  <LegalPageLayout
    title="Terms & Conditions"
    subtitle="The rules that apply when you use Storify’s websites, dashboard, APIs, and related services."
    currentPath="/terms"
  >
    <LegalSection title="1. Acceptance">
      <p>
        By accessing or using Storify, you agree to these Terms &amp; Conditions and our{' '}
        <Link to="/privacy-policy" className="text-storify-glow hover:underline">Privacy Policy</Link>.
        If you do not agree, do not use the service.
      </p>
    </LegalSection>

    <LegalSection title="2. Accounts">
      <ul className="list-disc pl-5 space-y-2">
        <li>You must provide accurate registration information and keep credentials secure.</li>
        <li>You are responsible for activity under your merchant, vendor, and staff accounts.</li>
        <li>We may suspend accounts that violate these terms or pose security / legal risk.</li>
      </ul>
    </LegalSection>

    <LegalSection title="3. The service">
      <p>
        Storify provides software tools to create and operate online stores. Features may change over time.
        We do not guarantee uninterrupted availability, but we work to keep the platform reliable.
      </p>
    </LegalSection>

    <LegalSection title="4. Merchant responsibilities">
      <ul className="list-disc pl-5 space-y-2">
        <li>Comply with applicable laws (including consumer, tax, and data protection rules).</li>
        <li>Publish accurate product information, pricing, and store policies for your customers.</li>
        <li>Use payment gateways only with credentials you are authorized to use.</li>
        <li>Do not use Storify for illegal, fraudulent, or prohibited goods/services.</li>
      </ul>
    </LegalSection>

    <LegalSection title="5. Fees &amp; billing">
      <p>
        Paid plans are billed according to the pricing shown at checkout or in your dashboard.
        See our <Link to="/refund-policy" className="text-storify-glow hover:underline">Refund Policy</Link> for
        subscription refunds. Taxes may apply based on your location.
      </p>
    </LegalSection>

    <LegalSection title="6. Intellectual property">
      <p>
        Storify’s branding, software, and documentation remain our property. You retain ownership of your
        store content (products, images, copy). You grant us a limited license to host and display that content
        to operate the service.
      </p>
    </LegalSection>

    <LegalSection title="7. Limitation of liability">
      <p>
        To the fullest extent permitted by law, Storify is not liable for indirect, incidental, or consequential
        damages, or for losses arising from merchant storefront sales, third-party gateways, or downtime beyond
        our reasonable control.
      </p>
    </LegalSection>

    <LegalSection title="8. Changes">
      <p>
        We may update these terms. Continued use after changes means you accept the updated terms.
        Material changes will be reflected with an updated date on this page.
      </p>
    </LegalSection>

    <LegalSection title="9. Contact">
      <p>
        Legal inquiries: <a href="mailto:legal@storify.in" className="text-storify-glow hover:underline">legal@storify.in</a>
        {' '}· <Link to="/contact" className="text-storify-glow hover:underline">Contact Us</Link>
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default TermsAndConditions;
