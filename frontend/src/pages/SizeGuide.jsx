import { useState } from 'react';
import { Ruler } from 'lucide-react';

const TABS = ['Women', 'Men', 'Shoes'];

const WOMEN_SIZES = [
  { size: 'XS', us: '0–2', eu: '32–34', chest: '31–32"', waist: '23–24"', hips: '33–34"' },
  { size: 'S',  us: '4–6', eu: '36–38', chest: '33–34"', waist: '25–26"', hips: '35–36"' },
  { size: 'M',  us: '8–10', eu: '40–42', chest: '35–36"', waist: '27–28"', hips: '37–38"' },
  { size: 'L',  us: '12–14', eu: '44–46', chest: '37–39"', waist: '29–31"', hips: '39–41"' },
  { size: 'XL', us: '16–18', eu: '48–50', chest: '40–42"', waist: '32–34"', hips: '42–44"' },
  { size: 'XXL',us: '20–22', eu: '52–54', chest: '43–45"', waist: '35–37"', hips: '45–47"' },
];

const MEN_SIZES = [
  { size: 'XS', chest: '33–34"', waist: '27–28"', hips: '33–34"', neck: '13–13.5"' },
  { size: 'S',  chest: '35–37"', waist: '29–30"', hips: '35–37"', neck: '14–14.5"' },
  { size: 'M',  chest: '38–40"', waist: '31–32"', hips: '38–40"', neck: '15–15.5"' },
  { size: 'L',  chest: '41–43"', waist: '33–34"', hips: '41–43"', neck: '16–16.5"' },
  { size: 'XL', chest: '44–46"', waist: '35–36"', hips: '44–46"', neck: '17–17.5"' },
  { size: 'XXL',chest: '47–49"', waist: '37–39"', hips: '47–49"', neck: '18–18.5"' },
];

const SHOE_SIZES = [
  { eu: '36', us_w: '5.5', us_m: '4', uk: '3', cm: '22.5' },
  { eu: '37', us_w: '6.5', us_m: '5', uk: '4', cm: '23.5' },
  { eu: '38', us_w: '7.5', us_m: '6', uk: '5', cm: '24' },
  { eu: '39', us_w: '8.5', us_m: '7', uk: '6', cm: '25' },
  { eu: '40', us_w: '9',   us_m: '7.5', uk: '6.5', cm: '25.5' },
  { eu: '41', us_w: '10',  us_m: '8', uk: '7', cm: '26' },
  { eu: '42', us_w: '11',  us_m: '9', uk: '8', cm: '27' },
  { eu: '43', us_w: '12',  us_m: '10', uk: '9', cm: '28' },
  { eu: '44', us_w: '13',  us_m: '11', uk: '10', cm: '29' },
];

const HOW_TO = [
  { title: 'Chest / Bust', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal and parallel to the ground.' },
  { title: 'Waist', desc: 'Measure around your natural waistline, the narrowest part of your torso, usually about an inch above your navel.' },
  { title: 'Hips', desc: 'Stand with feet together and measure around the fullest part of your hips and seat.' },
  { title: 'Foot Length', desc: 'Stand on a piece of paper, trace your foot, and measure from the heel to the longest toe in centimeters.' },
];

export default function SizeGuide() {
  const [tab, setTab] = useState('Women');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Fit Guide</p>
          <h1 className="text-5xl font-bold text-white mb-4">Size Guide</h1>
          <p className="text-stone-400 text-lg">Find your perfect fit every time.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* Tip Banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-10">
          <Ruler size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm leading-relaxed"><strong>Pro tip:</strong> When between sizes, we recommend sizing up for a more comfortable fit. All measurements are in inches unless noted.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-stone-100 p-1 rounded-2xl w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Women's Table */}
        {tab === 'Women' && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-900 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">US</th>
                  <th className="px-4 py-3 text-left font-semibold">EU</th>
                  <th className="px-4 py-3 text-left font-semibold">Chest</th>
                  <th className="px-4 py-3 text-left font-semibold">Waist</th>
                  <th className="px-4 py-3 text-left font-semibold">Hips</th>
                </tr>
              </thead>
              <tbody>
                {WOMEN_SIZES.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="px-4 py-3 font-bold text-stone-900">{row.size}</td>
                    <td className="px-4 py-3 text-stone-600">{row.us}</td>
                    <td className="px-4 py-3 text-stone-600">{row.eu}</td>
                    <td className="px-4 py-3 text-stone-600">{row.chest}</td>
                    <td className="px-4 py-3 text-stone-600">{row.waist}</td>
                    <td className="px-4 py-3 text-stone-600">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Men's Table */}
        {tab === 'Men' && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-900 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Chest</th>
                  <th className="px-4 py-3 text-left font-semibold">Waist</th>
                  <th className="px-4 py-3 text-left font-semibold">Hips</th>
                  <th className="px-4 py-3 text-left font-semibold">Neck</th>
                </tr>
              </thead>
              <tbody>
                {MEN_SIZES.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="px-4 py-3 font-bold text-stone-900">{row.size}</td>
                    <td className="px-4 py-3 text-stone-600">{row.chest}</td>
                    <td className="px-4 py-3 text-stone-600">{row.waist}</td>
                    <td className="px-4 py-3 text-stone-600">{row.hips}</td>
                    <td className="px-4 py-3 text-stone-600">{row.neck}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shoes Table */}
        {tab === 'Shoes' && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-900 text-white">
                  <th className="px-4 py-3 text-left font-semibold">EU</th>
                  <th className="px-4 py-3 text-left font-semibold">US Women</th>
                  <th className="px-4 py-3 text-left font-semibold">US Men</th>
                  <th className="px-4 py-3 text-left font-semibold">UK</th>
                  <th className="px-4 py-3 text-left font-semibold">CM</th>
                </tr>
              </thead>
              <tbody>
                {SHOE_SIZES.map((row, i) => (
                  <tr key={row.eu} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="px-4 py-3 font-bold text-stone-900">{row.eu}</td>
                    <td className="px-4 py-3 text-stone-600">{row.us_w}</td>
                    <td className="px-4 py-3 text-stone-600">{row.us_m}</td>
                    <td className="px-4 py-3 text-stone-600">{row.uk}</td>
                    <td className="px-4 py-3 text-stone-600">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* How to Measure */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-6">How to Measure</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_TO.map(item => (
              <div key={item.title} className="bg-stone-50 rounded-2xl p-5">
                <h3 className="font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
