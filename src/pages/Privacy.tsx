import React from "react";
import { Link } from "react-router-dom";

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-royal mb-6">Privacy Policy</h1>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-6" />
          <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600 mb-8">
            At Annaya Boutique, we value your privacy and are committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>

          <h2 className="text-2xl font-serif font-bold text-royal mt-10 mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-4">
            We collect information you provide directly to us, such as when you create an account, make a purchase, 
            subscribe to our newsletter, or contact customer support. This may include your name, email address, 
            phone number, shipping and billing addresses, and payment information.
          </p>

          <h2 className="text-2xl font-serif font-bold text-royal mt-10 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
            <li>Process and fulfill your orders, including sending order confirmations and tracking updates.</li>
            <li>Maintain and manage your account.</li>
            <li>Respond to your comments, questions, and customer service requests.</li>
            <li>Communicate with you about products, services, offers, and promotions (if opted in).</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-royal mt-10 mb-4">3. Data Sharing and Disclosure</h2>
          <p className="text-slate-600 mb-4">
            We do not sell your personal information. We may share your data with trusted third-party service 
            providers (such as payment processors and shipping aggregators) strictly for the purpose of fulfilling 
            your orders and running our business operations.
          </p>

          <h2 className="text-2xl font-serif font-bold text-royal mt-10 mb-4">4. Security</h2>
          <p className="text-slate-600 mb-4">
            We implement reasonable security measures to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. However, no electronic transmission or storage is 100% secure.
          </p>

          <h2 className="text-2xl font-serif font-bold text-royal mt-10 mb-4">5. Contact Us</h2>
          <p className="text-slate-600 mb-8">
            If you have any questions or concerns about this Privacy Policy, please <Link to="/contact" className="text-royal hover:text-gold font-bold underline underline-offset-4">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};
