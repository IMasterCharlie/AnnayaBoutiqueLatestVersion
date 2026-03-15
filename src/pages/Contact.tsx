import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-royal mb-6">Contact Us</h1>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-6" />
          <p className="text-slate-600 text-lg leading-relaxed">
            We'd love to hear from you. Whether you have a question about our products,
            need assistance with an order, or just want to share your feedback, our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-royal mb-6">Get in Touch</h2>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 bg-royal/10 text-royal rounded-full flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Phone / WhatsApp</h3>
                <a href="tel:+917494954286" className="text-lg font-bold text-slate-900 hover:text-royal transition-colors">
                  +91 74949 54286
                </a>
                <p className="text-slate-500 text-sm mt-1">Mon-Sat: 10am to 7pm (IST)</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 bg-royal/10 text-royal rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Email</h3>
                <a href="mailto:ananyaboutqiue9495@gmail.com" className="text-lg font-bold text-slate-900 hover:text-royal transition-colors">
                  ananyaboutqiue9495@gmail.com
                </a>
                <p className="text-slate-500 text-sm mt-1">We typically reply within 24 hours</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 bg-royal/10 text-royal rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Location</h3>
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  Mumbai
                </p>
                <p className="text-slate-500 text-sm mt-1">Maharashtra, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-serif font-bold text-royal mb-6">Send us a Message</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sending is not currently active. Please contact us via phone or email."); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                  <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-royal/50 focus:ring-4 focus:ring-royal/10 transition-all font-medium" placeholder="E.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input required type="email" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-royal/50 focus:ring-4 focus:ring-royal/10 transition-all font-medium" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <input required type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-royal/50 focus:ring-4 focus:ring-royal/10 transition-all font-medium" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea required rows={5} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-royal/50 focus:ring-4 focus:ring-royal/10 transition-all font-medium resize-none" placeholder="Write your message here..." />
              </div>
              <button type="submit" className="w-full py-4 bg-royal text-white font-bold rounded-2xl hover:bg-sapphire shadow-xl shadow-royal/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Submit Message <Send className="w-4 h-4 mt-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
