import { useState } from 'react';
import { Mail, MessageCircle, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Get In Touch</p>
          <h1 className="text-5xl font-bold text-white mb-4">We'd Love<br />to Hear From You</h1>
          <p className="text-stone-400 text-lg">Our team typically responds within 2 hours on business days.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-stone-50 rounded-3xl p-6">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle size={20} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Live Chat</h3>
              <p className="text-stone-500 text-sm">Chat with us directly from any page using the chat bubble. Available Mon–Fri, 9am–6pm.</p>
            </div>
            <div className="bg-stone-50 rounded-3xl p-6">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4">
                <Mail size={20} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Email Us</h3>
              <p className="text-stone-500 text-sm mb-2">For non-urgent inquiries:</p>
              <a href="mailto:support@boutique.com" className="text-amber-600 font-medium text-sm hover:underline">support@boutique.com</a>
            </div>
            <div className="bg-stone-50 rounded-3xl p-6">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4">
                <Clock size={20} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-stone-900 mb-2">Business Hours</h3>
              <div className="space-y-1 text-sm text-stone-600">
                <div className="flex justify-between"><span>Monday – Friday</span><span className="font-medium">9am – 6pm</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="font-medium">10am – 4pm</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="text-stone-400">Closed</span></div>
              </div>
            </div>
            <div className="bg-stone-50 rounded-3xl p-6">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-4">
                <MapPin size={20} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Office</h3>
              <p className="text-stone-500 text-sm">Boutique HQ<br />Addis Ababa, Ethiopia</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-3">Message Sent!</h2>
                <p className="text-stone-500 max-w-sm">Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at {form.email} within 2 business hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-8 text-amber-600 font-medium hover:underline text-sm">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Send a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Jane Smith"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Subject *</label>
                  <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition-colors bg-white">
                    <option value="">Select a topic...</option>
                    <option>Order Issue</option>
                    <option>Return / Exchange</option>
                    <option>Product Question</option>
                    <option>Payment Problem</option>
                    <option>Shipping Delay</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Tell us how we can help you..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition-colors resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <p className="text-stone-400 text-xs text-center">We respond within 2 business hours · Mon–Fri 9am–6pm</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
