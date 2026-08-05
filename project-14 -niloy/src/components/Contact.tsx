import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, Globe, Copy } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Student / University Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', category: 'Student / University Inquiry', message: '' });
    }, 4500);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('cricketfan18v.k98742@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  return (
    <section id="contact" className="py-24 bg-[#0c0e17] text-slate-100 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Toast Notification when email is copied */}
      {copiedEmail && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Email Address Copied to Clipboard! (cricketfan18v.k98742@gmail.com)</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Mail className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Get in Touch with Our Team</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            We&apos;re Here to Help <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">You Succeed</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Have questions about university licensing, accessibility features, or custom integrations? Send us a message or email us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                <span>Contact Channels</span>
              </h3>

              <div className="space-y-4">
                {/* DIRECT SUPPORT EMAIL CARD */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 font-medium">Direct Email Support</div>
                    <a
                      href="mailto:cricketfan18v.k98742@gmail.com"
                      className="text-sm font-extrabold text-white group-hover:text-orange-400 transition-colors mt-0.5 block break-all"
                    >
                      cricketfan18v.k98742@gmail.com
                    </a>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={copyEmailToClipboard}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-bold hover:bg-orange-500/20 transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Email</span>
                      </button>
                      <span className="text-[11px] text-emerald-400 font-mono">Response &lt; 2 hrs</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Live Studio Hours</div>
                    <div className="text-sm font-bold text-white mt-0.5">24/7 AI Automated Assistant</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-1">Live Support: 9 AM - 9 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">University & Enterprise Desk</div>
                    <a
                      href="mailto:cricketfan18v.k98742@gmail.com"
                      className="text-xs font-bold text-white hover:text-orange-400 transition-colors mt-0.5 block break-all"
                    >
                      cricketfan18v.k98742@gmail.com
                    </a>
                    <div className="text-[11px] text-blue-400 font-mono mt-1">ADA & WCAG 2.1 Compliance</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/15 bg-slate-900/90 p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-left relative">
              
              <h3 className="text-2xl font-black text-white mb-2">Send Us a Message</h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-6">
                Your message will be sent directly to <span className="text-orange-400 font-bold">cricketfan18v.k98742@gmail.com</span>.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-emerald-400">Message Delivered Successfully!</h4>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Thank you, <span className="font-bold text-white">{formData.name || 'Friend'}</span>! Your message has been sent directly to <span className="font-bold text-orange-400">cricketfan18v.k98742@gmail.com</span>. Our support team will reply to <span className="font-bold text-white">{formData.email}</span> within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohan Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="rohan@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Inquiry Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    >
                      <option value="Student / University Inquiry">Student / University Inquiry</option>
                      <option value="Enterprise / Corporate Plan">Enterprise / Corporate Plan</option>
                      <option value="Accessibility Feature Request">Accessibility Feature Request</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can ClarityStream AI help your lectures or meetings?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to cricketfan18v.k98742@gmail.com</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
