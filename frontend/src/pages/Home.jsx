import React from 'react';
import { Link } from 'react-router-dom';

const featureLinks = [
  { label: 'Login', to: '/login' },
  { label: 'Sign Up', to: '/signup' },
];

const IconShield = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 4.5 6v5.8c0 4.9 3.3 9.2 7.5 10.2 4.2-1 7.5-5.3 7.5-10.2V6L12 3Z" />
    <path d="M12 8v8" />
    <path d="M9.5 11.2 12 8.7l2.5 2.5" />
    <path d="M9.2 14.5h5.6" />
  </svg>
);

const CyberIllustration = () => (
  <svg viewBox="0 0 640 520" className="w-full h-auto" role="img" aria-label="Cyber shield illustration">
    <defs>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="640" height="520" rx="32" fill="#09111f" />
    <circle cx="320" cy="260" r="190" fill="url(#ringGradient)" opacity="0.18" className="transition-all duration-1000 group-hover:scale-[1.05] origin-[320px_260px]" />
    <circle cx="320" cy="260" r="145" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="2" fill="none" className="transition-all duration-1000 group-hover:scale-[1.02] origin-[320px_260px]" />
    <circle cx="320" cy="260" r="98" stroke="#67e8f9" strokeOpacity="0.32" strokeWidth="2" fill="none" className="transition-all duration-700 group-hover:scale-[0.96] origin-[320px_260px]" />
    <path d="M320 106 430 150v96c0 90-55 152-110 180-55-28-110-90-110-180v-96l110-44Z" fill="url(#shieldGradient)" stroke="#a5f3fc" strokeWidth="3" className="transition-all duration-500 group-hover:scale-[1.03] origin-[320px_260px]" />
    <path d="M320 154v172" stroke="#dbeafe" strokeWidth="7" strokeLinecap="round" className="transition-all duration-500 group-hover:translate-y-[-2px]" />
    <path d="M276 195 320 155l44 40" stroke="#dbeafe" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 group-hover:translate-y-[-4px]" />
    <path d="M274 255h92" stroke="#dbeafe" strokeWidth="7" strokeLinecap="round" />
    <circle cx="320" cy="260" r="18" fill="#0f172a" stroke="#67e8f9" strokeWidth="5" className="transition-all duration-500 group-hover:scale-110 origin-[320px_260px]" />
    <path d="M132 180h70m236 0h70M122 324h84m232 0h84" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
    <path d="M190 145 242 197m206-52-52 52m-206 153 52-52m206 52-52-52" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
    <circle cx="148" cy="180" r="10" fill="#22d3ee" className="transition-all duration-300 group-hover:scale-110 origin-[148px_180px]" />
    <circle cx="492" cy="180" r="10" fill="#22d3ee" className="transition-all duration-300 group-hover:scale-110 origin-[492px_180px]" />
    <circle cx="148" cy="324" r="10" fill="#22d3ee" className="transition-all duration-300 group-hover:scale-110 origin-[148px_324px]" />
    <circle cx="492" cy="324" r="10" fill="#22d3ee" className="transition-all duration-300 group-hover:scale-110 origin-[492px_324px]" />
    <g fill="none" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round">
      <path d="M210 380c42-30 178-30 220 0" />
      <path d="M244 394c32-18 120-18 152 0" />
      <path d="M270 408c19-8 81-8 100 0" />
    </g>
    <circle cx="250" cy="382" r="5" fill="#67e8f9" />
    <circle cx="390" cy="382" r="5" fill="#67e8f9" />
    <circle cx="320" cy="396" r="5" fill="#67e8f9" />
  </svg>
);;

const Home = () => {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-800/80 bg-slate-950/70 px-4 py-4 shadow-[0_12px_40px_rgba(2,8,23,0.45)] backdrop-blur-md sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-slate-900 shadow-[0_0_28px_rgba(34,211,238,0.35)] hover:shadow-[0_0_35px_rgba(34,211,238,0.65)] hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
                <IconShield />
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-semibold tracking-wide text-white">SecureShield AI</p>
                <p className="max-w-xs text-xs leading-5 text-slate-300 sm:text-sm">Intelligent Cybersecurity Threat Detection System</p>
              </div>
            </div>

            <div className="text-center hidden lg:block">
              <p className="text-xl font-semibold tracking-wide text-white sm:text-2xl">SecureShield AI</p>
              <p className="text-xs text-slate-400 sm:text-sm">Intelligent Cybersecurity Threat Detection System</p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
              {featureLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                    link.label === 'Sign Up'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20 hover:from-blue-400 hover:to-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]'
                      : 'border border-slate-700 bg-slate-900/60 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.18)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
                AI-powered threat monitoring for modern teams
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Protect Your Digital World with AI
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                SecureShield AI is an intelligent cybersecurity platform that detects cyber threats in real time using Artificial Intelligence. It monitors user activity, analyzes uploaded files, detects phishing URLs, calculates AI-based risk scores, and instantly alerts administrators about suspicious activities.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/signup"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(34,211,238,0.22)] transition-all duration-300 hover:from-blue-400 hover:to-cyan-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_#00f3ff,0_0_40px_rgba(0,243,255,0.35)]"
                >
                  Get Started
                </Link>
                <a
                  href="#contact"
                  className="rounded-full border border-slate-700 bg-slate-900/60 px-7 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-cyan-400 hover:text-cyan-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(0,243,255,0.18)]"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="group rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4 shadow-[0_20px_60px_rgba(2,8,23,0.45)] hover:border-cyan-400/40 hover:shadow-[0_0_50px_rgba(34,211,238,0.18)] transition-all duration-500 hover:scale-[1.02] cursor-pointer">
              <CyberIllustration />
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-800 py-6 text-sm text-slate-400">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-slate-300">SecureShield AI</p>
            <p>© 2026 SecureShield AI</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;