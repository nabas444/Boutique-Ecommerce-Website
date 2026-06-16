import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';

const PERKS = [
  { emoji: '🏖️', title: 'Flexible PTO', desc: 'Take the time you need. We trust you.' },
  { emoji: '💻', title: 'Remote First', desc: 'Work from anywhere in the world.' },
  { emoji: '📚', title: 'Learning Budget', desc: '$1,000/year for courses and books.' },
  { emoji: '🏥', title: 'Health Coverage', desc: 'Full medical, dental, and vision.' },
  { emoji: '👗', title: 'Staff Discount', desc: '40% off everything in the store.' },
  { emoji: '🚀', title: 'Equity', desc: 'Share in the company\'s success.' },
];

const JOBS = [
  {
    title: 'Senior Frontend Developer',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We\'re looking for a React expert to help us build the next generation of our shopping experience. You\'ll work closely with our design team to ship beautiful, performant features.',
    requirements: ['3+ years React experience', 'Strong TypeScript skills', 'Eye for great UI/UX', 'Experience with Tailwind CSS'],
  },
  {
    title: 'Fashion Buyer',
    team: 'Merchandising',
    location: 'Addis Ababa',
    type: 'Full-time',
    description: 'Join our curation team and help us discover the next great fashion brands. You\'ll build supplier relationships, analyze trends, and maintain our high quality bar.',
    requirements: ['Fashion buying experience', 'Strong negotiation skills', 'Trend forecasting knowledge', 'Data-driven mindset'],
  },
  {
    title: 'Customer Experience Lead',
    team: 'Support',
    location: 'Remote',
    type: 'Full-time',
    description: 'Be the voice of Boutique. You\'ll manage our support team, resolve complex customer issues, and build systems that make every interaction exceptional.',
    requirements: ['3+ years in customer support', 'Team management experience', 'Excellent written communication', 'Problem-solving skills'],
  },
  {
    title: 'Growth Marketing Manager',
    team: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Drive customer acquisition and retention through data-driven campaigns. You\'ll own our paid channels, email strategy, and influencer partnerships.',
    requirements: ['Performance marketing experience', 'Email marketing expertise', 'Strong analytics skills', 'E-commerce background preferred'],
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Join the Team</p>
          <h1 className="text-6xl font-bold text-white mb-6">Build the future<br /><span className="text-amber-400">of fashion.</span></h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">We're a small, ambitious team on a mission to make premium fashion accessible to everyone. Come help us build it.</p>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2 text-center">Why Boutique</p>
        <h2 className="text-3xl font-bold text-stone-900 mb-10 text-center">Perks & Benefits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {PERKS.map(p => (
            <div key={p.title} className="bg-stone-50 rounded-3xl p-5">
              <span className="text-3xl mb-3 block">{p.emoji}</span>
              <h3 className="font-bold text-stone-900 mb-1">{p.title}</h3>
              <p className="text-stone-500 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Open Roles */}
        <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2">Open Positions</p>
        <h2 className="text-3xl font-bold text-stone-900 mb-8">We're Hiring</h2>
        <div className="space-y-4">
          {JOBS.map(job => (
            <div key={job.title} className="border border-stone-200 rounded-3xl p-6 hover:border-stone-400 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{job.title}</h3>
                  <p className="text-amber-600 text-sm font-medium">{job.team}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                    <MapPin size={12} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                    <Clock size={12} /> {job.type}
                  </span>
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.map(r => (
                  <span key={r} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">{r}</span>
                ))}
              </div>
              <a href={`mailto:careers@boutique.com?subject=Application: ${job.title}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 hover:text-amber-600 transition-colors">
                Apply Now <ArrowRight size={15} />
              </a>
            </div>
          ))}
        </div>

        {/* No Role CTA */}
        <div className="bg-stone-900 rounded-3xl p-8 text-center mt-10">
          <Sparkles size={28} className="text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Don't see a perfect fit?</h3>
          <p className="text-stone-400 mb-6">We're always interested in exceptional people. Send us your resume and we'll keep it on file.</p>
          <a href="mailto:careers@boutique.com?subject=General Application"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors">
            Send Open Application
          </a>
        </div>
      </section>
    </div>
  );
}
