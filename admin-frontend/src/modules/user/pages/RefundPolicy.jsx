import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout';

const RefundPolicy = () => (
  <LegalPageLayout
    title="Refund Policy"
    subtitle="How refunds work for Storify platform subscriptions and for orders on merchant storefronts."
    currentPath="/refund-policy"
  >
    <LegalSection title="1. Platform subscription refunds">
      <p>
        Storify subscription fees (monthly or yearly plans) are generally non-refundable once a billing period has
        started, except where required by law or expressly stated in a written promotion.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>You may cancel anytime; access continues until the end of the paid period.</li>
        <li>Duplicate charges or billing errors will be reviewed and corrected promptly.</li>
        <li>Refund requests for subscriptions: email <a href="mailto:billing@storify.in" className="text-storify-glow hover:underline">billing@storify.in</a> within 7 days of the charge with your account email and invoice ID.</li>
      </ul>
    </LegalSection>

    <LegalSection title="2. Merchant storefront orders">
      <p>
        Products sold on individual merchant or vendor stores are fulfilled by those sellers — not by Storify as the
        seller of record (unless Storify is itself the merchant).
      </p>
      <p>
        Returns, exchanges, and refunds for storefront orders follow the merchant&apos;s own refund / return policy.
        Customers should contact the store that processed their order.
      </p>
    </LegalSection>

    <LegalSection title="3. Payment gateway disputes">
      <p>
        Chargebacks and payment disputes are handled under the rules of the payment provider (e.g. Razorpay, PayU)
        and the card network. We may share order and account data needed to resolve a dispute.
      </p>
    </LegalSection>

    <LegalSection title="4. How to request help">
      <p>
        For platform billing issues, use <Link to="/contact" className="text-storify-glow hover:underline">Contact Us</Link>
        {' '}or write to billing@storify.in. We aim to respond within 2 business days.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default RefundPolicy;
