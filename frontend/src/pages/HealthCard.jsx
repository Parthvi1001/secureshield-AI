import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

const HealthCard = () => {
  const [healthData, setHealthData] = useState({
    security_score: 100,
    files_scanned: 0,
    threats_prevented: 0,
    most_common_threat: 'None',
    last_scan: 'No scans yet',
    recommendations: [],
    monthly_progress: '↑ +0% Stable'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthCard = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/health-card/');
        setHealthData(res.data);
      } catch (err) {
        console.error("Failed to load security health card data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHealthCard();
  }, []);

  const score = healthData.security_score;
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;
  
  let scoreColorClass = "text-green-400";
  let scoreBorderClass = "border-green-500/20";
  let scoreBgGlow = "shadow-[0_0_30px_rgba(74,222,128,0.15)]";
  let scoreText = "Excellent";
  
  if (score < 60) {
    scoreColorClass = "text-alert-red";
    scoreBorderClass = "border-alert-red/20";
    scoreBgGlow = "shadow-[0_0_30px_rgba(239,68,68,0.15)]";
    scoreText = "Needs Attention";
  } else if (score < 80) {
    scoreColorClass = "text-yellow-400";
    scoreBorderClass = "border-yellow-500/20";
    scoreBgGlow = "shadow-[0_0_30px_rgba(250,204,21,0.15)]";
    scoreText = "Moderate";
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Security Health Card</h2>
        <p className="text-sm text-neon-blue/70">Personalized overview of your security standing, scan telemetry, and recommended precautions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton type="chart" />
            <div className="lg:col-span-2">
              <Skeleton type="metrics" count={4} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Card Container */}
          <div className="glass-panel p-6 md:p-8 border-neon-blue/20">
            <h3 className="text-lg font-bold text-neon-blue mb-8 uppercase tracking-widest flex items-center border-b border-neon-blue/20 pb-3">
              <span className="mr-3">👤</span> Security Profile Overview
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Radial Gauge Column */}
              <div className={`flex flex-col items-center justify-center bg-white/5 p-6 rounded-2xl border border-white/5 ${scoreBgGlow} transition-all duration-500`}>
                <h4 className="text-xs uppercase text-white/60 tracking-widest mb-6 font-mono font-bold">Overall Security Score</h4>
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-current text-white/5"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`stroke-current ${scoreColorClass} transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-4xl font-black text-white">{score}</span>
                    <span className="text-xs text-white/40 mt-1">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest mt-6 px-4 py-1.5 rounded-full border ${scoreBorderClass} ${scoreColorClass} bg-white/5`}>
                  {scoreText}
                </span>
              </div>

              {/* Metrics Grid Column */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Files Scanned */}
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-neon-blue/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/50 tracking-wider">Total Files Scanned</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{healthData.files_scanned}</p>
                  </div>
                </div>

                {/* Threats Prevented */}
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-green-400/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/50 tracking-wider">Threats Prevented</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{healthData.threats_prevented}</p>
                  </div>
                </div>

                {/* Most Common Threat */}
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-alert-red/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-alert-red/10 text-alert-red">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/50 tracking-wider">Most Common Threat</p>
                    <p className="text-lg font-bold text-white truncate max-w-[200px] mt-1 font-mono" title={healthData.most_common_threat}>
                      {healthData.most_common_threat}
                    </p>
                  </div>
                </div>

                {/* Last Scan */}
                <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-neon-purple/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/10 text-neon-purple">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/50 tracking-wider">Last Scan Date</p>
                    <p className="text-base font-bold text-white mt-1 font-mono">{healthData.last_scan}</p>
                  </div>
                </div>

                {/* Monthly Progress */}
                <div className="sm:col-span-2 flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    healthData.monthly_progress.startsWith('↑') ? 'bg-green-500/10 text-green-400' : 'bg-alert-red/10 text-alert-red'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/50 tracking-wider">Monthly Progress</p>
                    <p className={`text-base font-bold mt-1 font-mono ${
                      healthData.monthly_progress.startsWith('↑') ? 'text-green-400' : 'text-alert-red'
                    }`}>
                      {healthData.monthly_progress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Recommendations */}
          <div className="glass-panel p-6 md:p-8 border-neon-blue/20">
            <h3 className="text-lg font-bold text-neon-blue mb-6 uppercase tracking-widest flex items-center border-b border-neon-blue/20 pb-3">
              <span className="mr-3">⚡</span> Recommended Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthData.recommendations.map((rec, index) => (
                <div key={index} className="bg-white/5 p-5 rounded-xl border border-white/5 flex items-start space-x-3 hover:border-neon-blue/35 hover:bg-neon-blue/5 transition-all duration-300 group">
                  <div className="h-6 w-6 rounded bg-neon-blue/10 flex items-center justify-center text-neon-blue mt-0.5 group-hover:scale-115 transition-transform duration-300">
                    •
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white tracking-wide">Precautionary Guideline</p>
                    <p className="text-xs text-white/70 leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Calculation logic explainer */}
          <div className="glass-panel p-6 md:p-8 border-neon-purple/20">
            <h3 className="text-lg font-bold text-neon-purple mb-6 uppercase tracking-widest flex items-center border-b border-neon-purple/20 pb-3">
              <span className="mr-3">⚙️</span> Score Calculation Engine
            </h3>
            <div className="prose prose-invert text-xs text-white/60 leading-relaxed font-mono space-y-3">
              <p>SecureShield AI calculates your Overall Security Score dynamically using a multivariable heuristic algorithm:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-white font-bold">Base Score:</span> Starts at 100 points.</li>
                <li><span className="text-white font-bold">Unresolved Threats:</span> Deducts <span className="text-alert-red font-bold">-15</span> points for each file scan categorized as MALICIOUS or SUSPICIOUS without remediation.</li>
                <li><span className="text-white font-bold">Remediated (Cleaned) Threats:</span> Deducts only <span className="text-yellow-400 font-bold">-3</span> points for each successfully sanitized file scan.</li>
                <li><span className="text-white font-bold">Security Alerts:</span> Deducts points based on active unacknowledged incidents (Critical: -20, High: -10, Medium: -5).</li>
                <li><span className="text-white font-bold">Safe File Bonus:</span> Grants <span className="text-green-400 font-bold">+2</span> points for each successfully validated SAFE file (capped at +15 points).</li>
                <li><span className="text-white font-bold">Activity Bonus:</span> Grants <span className="text-green-400 font-bold">+5</span> points if you scanned any document in the last 7 days.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCard;
