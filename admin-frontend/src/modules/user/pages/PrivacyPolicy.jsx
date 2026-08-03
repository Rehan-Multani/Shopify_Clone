import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout';

const PrivacyPolicy = () => (
  <LegalPageLayout
    title="Privacy Policy"
    subtitle="How Storify collects, uses, and protects information when you use our platform and websites."
    currentPath="/privacy-policy"
  >
    <LegalSection title="1. Introduction">
      <p>
        This Privacy Policy explains how Storify (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) handles personal data
        when you visit storify.in, create a merchant account, operate a storefront, or otherwise use our services.
      </p>
    </LegalSection>

    <LegalSection title="2. Information we collect">
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-gray-200">Account data</strong> — name, email, phone, business details you provide at signup.</li>
        <li><strong className="text-gray-200">Store &amp; order data</strong> — products, customers, and orders you manage in the dashboard.</li>
        <li><strong className="text-gray-200">Payment configuration</strong> — gateway settings you connect (secrets are encrypted; we do not store full card numbers).</li>
        <li><strong className="text-gray-200">Usage data</strong> — logs, device/browser info, and analytics needed to operate and secure the service.</li>
      </ul>
    </LegalSection>

    <LegalSection title="3. How we use information">
      <ul className="list-disc pl-5 space-y-2">
        <li>Provide, maintain, and improve the Storify platform</li>
        <li>Process subscriptions and support requests</li>
        <li>Send transactional emails (password reset, billing, alerts)</li>
        <li>Detect fraud, abuse, and security incidents</li>
        <li>Comply with legal obligations</li>
      </ul>
    </LegalSection>

    <LegalSection title="4. Sharing">
      <p>
        We do not sell your personal data. We may share limited data with trusted processors (hosting, email, payment
        providers) solely to run Storify, or when required by law.
      </p>
      <p>
        Merchant storefronts collect customer data under the merchant&apos;s responsibility. Merchants should publish
        their own privacy notice for shoppers.
      </p>
    </LegalSection>

    <LegalSection title="5. Security &amp; retention">
      <p>
        We use encryption in transit and at rest where appropriate, access controls, and operational safeguards.
        Data is retained while your account is active and as needed for legal, billing, or security purposes.
      </p>
    </LegalSection>

    <LegalSection title="6. Your choices">
      <p>
        You may update account details in the dashboard, request access or deletion by contacting us, and opt out of
        non-essential marketing emails.
      </p>
    </LegalSection>

    <LegalSection title="7. Contact">
      <p>
        Privacy questions: <a href="mailto:privacy@storify.in" className="text-storify-glow hover:underline">privacy@storify.in</a>
        {' '}or visit <Link to="/contact" className="text-storify-glow hover:underline">Contact Us</Link>.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default PrivacyPolicy;
