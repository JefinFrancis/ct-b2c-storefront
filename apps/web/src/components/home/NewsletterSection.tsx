/**
 * NewsletterSection — email newsletter sign-up section for the homepage.
 */
"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: Connect to a real newsletter API (e.g. Mailchimp, Klaviyo) in production
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="bg-brand-700 dark:bg-brand-900 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold text-white">Stay in the Loop</h2>
        <p className="mt-3 text-brand-200">
          Subscribe to our newsletter for exclusive offers, new arrivals, and style inspiration — delivered straight to your inbox.
        </p>

        {status === "success" ? (
          <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-400/30 text-green-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re subscribed! Check your inbox for a welcome discount.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-brand-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-brand-300">
          No spam, ever. Unsubscribe at any time. By subscribing you agree to our Privacy Policy.
        </p>
      </div>
    </section>
  );
}
