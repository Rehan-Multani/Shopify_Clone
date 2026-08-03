import React, { useState } from 'react';
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    // Client-side contact for now — opens mail client with prefilled details
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || 'Storify inquiry');
    window.location.href = `mailto:support@storify.in?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="Questions about plans, onboarding, or your store? We'd love to hear from you."
      currentPath="/contact"
    >
      <LegalSection title="Reach the team">
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Email</p>
            <a href="mailto:support@storify.in" className="text-white font-semibold hover:text-storify-glow transition-colors">
              support@storify.in
            </a>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Hours</p>
            <p className="text-white font-semibold">Mon–Sat, 10:00 AM – 7:00 PM IST</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Send a message">
        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-200 text-sm font-semibold">
            Thanks — your mail client should open with your message. If it didn&apos;t, email us directly at{' '}
            <a href="mailto:support@storify.in" className="underline">support@storify.in</a>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 not-prose max-w-xl">
            {error && (
              <p className="text-sm text-red-400 font-semibold">{error}</p>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-storify/50"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-storify/50"
                placeholder="you@business.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-storify/50"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Message *</label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-storify/50 resize-y"
                placeholder="Tell us a bit about your store or question…"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 teal-gradient text-white font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-lg active:scale-95"
            >
              Send Message
            </button>
          </form>
        )}
      </LegalSection>
    </LegalPageLayout>
  );
};

export default ContactUs;
