import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout';

const AboutUs = () => (
  <LegalPageLayout
    title="About Us"
    subtitle="We're building the commerce platform that helps Indian entrepreneurs start, run, and grow online businesses."
    currentPath="/about"
  >
    <LegalSection title="Who we are">
      <p>
        Storify is a modern ecommerce platform designed for merchants who want a complete online store —
        products, orders, payments, vendors, and storefront themes — without stitching together dozens of tools.
      </p>
      <p>
        Whether you run a single brand store or a multi-vendor marketplace, Storify gives you the building blocks
        to sell online with confidence.
      </p>
    </LegalSection>

    <LegalSection title="What we believe">
      <p>
        Commerce should be simple for sellers and delightful for buyers. We focus on clear workflows,
        secure payments, and storefronts that look professional out of the box.
      </p>
    </LegalSection>

    <LegalSection title="Built for growth">
      <ul className="list-disc pl-5 space-y-2">
        <li>Launch a branded storefront in minutes</li>
        <li>Manage catalog, customers, and orders from one dashboard</li>
        <li>Accept online payments with leading Indian gateways</li>
        <li>Scale from single-vendor to multi-vendor marketplace</li>
      </ul>
    </LegalSection>

    <LegalSection title="Get in touch">
      <p>
        Have a question about Storify? Visit our{' '}
        <Link to="/contact" className="text-storify-glow hover:underline">Contact Us</Link> page
        or explore{' '}
        <Link to="/pricing" className="text-storify-glow hover:underline">Pricing</Link>.
      </p>
    </LegalSection>
  </LegalPageLayout>
);

export default AboutUs;
