import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState({
    security_score: 'N/A',
    last_login: null,
    protected_files: 0,
    blocked_threats: 0,
    suspicious_logins: 0,
    recent_alerts: [],
    recent_scans: [],
    recent_cleaned_files: []
  });
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
    const fetchDashboard = async () => {
      setIsLoading(true);
      
      // Fetch summary first
      try {
        const summaryRes = await api.get('/dashboard/summary/');
        setData(summaryRes.data);
      } catch (err) {
        console.error("Failed to load dashboard summary data", err);
      }

      // Fetch health card data separately so that any endpoint error doesn't block the rest of the dashboard
      try {
        const healthRes = await api.get('/dashboard/health-card/');
        setHealthData(healthRes.data);
      } catch (err) {
        console.error("Failed to load security health card data", err);
      }

      setIsLoading(false);
    };
    fetchDashboard();
  }, []);

  // Chart Configurations
  const chartAnimation = {
    duration: 1200,
    easing: 'easeOutQuart'
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Threat Trend (7 Days)', color: '#00f3ff', font: { family: 'Orbitron', size: 12 } },
    },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
      y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
    }
  };

  const threatData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      fill: true,
      label: 'Threats Blocked',
      data: [5, 12, 3, 22, 8, 4, data.blocked_threats],
      borderColor: '#00f3ff',
      backgroundColor: 'rgba(0, 243, 255, 0.1)',
      tension: 0.4,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Login Activity By Country', color: '#b535f6', font: { family: 'Orbitron', size: 12 } },
    },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
      y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
    }
  };

  const loginData = {
    labels: ['US', 'UK', 'DE', 'IN', 'JP'],
    datasets: [{
      label: 'Logins',
      data: [45, 20, 12, 5, 2],
      backgroundColor: '#b535f6',
      borderRadius: 4
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: chartAnimation,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 9 } } },
      title: { display: true, text: 'Risk Level Breakdown', color: '#ff2a2a', font: { family: 'Orbitron', size: 12 } },
    }
  };

  const riskData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [60, 25, 10, data.suspicious_logins],
      backgroundColor: ['#00f3ff', '#b535f6', '#ffaa00', '#ff2a2a'],
      borderWidth: 1,
      borderColor: '#18181b'
    }],
  };

  const score = healthData.security_score;
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;
  
  let scoreColorClass = "text-green-400";
  let scoreBorderClass = "border-green-500/20";
  let scoreText = "Excellent";
  
  if (score < 60) {
    scoreColorClass = "text-alert-red";
    scoreBorderClass = "border-alert-red/20";
    scoreText = "Needs Attention";
  } else if (score < 80) {
    scoreColorClass = "text-yellow-400";
    scoreBorderClass = "border-yellow-500/20";
    scoreText = "Moderate";
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Security Dashboard</h2>
        <p className="text-sm text-neon-blue/70">Real-time status updates and machine learning cyber scanning telemetry.</p>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton type="metrics" count={5} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton type="chart" /></div>
            <div><Skeleton type="chart" /></div>
          </div>
        </div>
      ) : (
        <>
          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Score */}
            <div className="glass-panel text-center p-4">
              <h3 className="text-xs uppercase text-neon-blue/70 tracking-wider">Security Score</h3>
              <p className="text-3xl font-extrabold neon-text mt-2">{data.security_score}</p>
            </div>
            
            {/* Last Login */}
            <div className="glass-panel text-center p-4">
              <h3 className="text-xs uppercase text-neon-blue/70 tracking-wider">Last Connection</h3>
              <p className="text-sm font-bold mt-3 font-mono text-white/90">
                {data.last_login ? new Date(data.last_login).toLocaleString() : 'Never'}
              </p>
            </div>

            {/* Protected */}
            <div className="glass-panel-purple text-center p-4 border border-neon-purple/20">
              <h3 className="text-xs uppercase text-neon-purple/80 tracking-wider">Protected Files</h3>
              <p className="text-3xl font-extrabold text-neon-purple drop-shadow-[0_0_8px_#b535f6] mt-2">{data.protected_files}</p>
            </div>

            {/* Threats */}
            <div className="glass-panel-red text-center p-4 border border-alert-red/20">
              <h3 className="text-xs uppercase text-alert-red/80 tracking-wider">Blocked Threats</h3>
              <p className="text-3xl font-extrabold text-alert-red drop-shadow-[0_0_8px_#ff2a2a] mt-2">{data.blocked_threats}</p>
            </div>

            {/* Suspicious */}
            <div className="glass-panel-red text-center p-4 border border-alert-red/20">
              <h3 className="text-xs uppercase text-alert-red/80 tracking-wider">Suspicious Logins</h3>
              <p className="text-3xl font-extrabold text-alert-red drop-shadow-[0_0_8px_#ff2a2a] mt-2">{data.suspicious_logins}</p>
            </div>
          </div>

          {/* Security Health Card Section */}
          <div className="glass-panel p-6 border-neon-blue/20">
            <h3 className="text-lg font-bold text-neon-blue mb-6 uppercase tracking-widest flex items-center border-b border-neon-blue/20 pb-2">
              <span className="mr-2">👤</span> User Security Health Card
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score Circular Gauge */}
              <div className="flex flex-col items-center justify-center bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs uppercase text-white/60 tracking-wider mb-4 font-mono">Overall Security Score</h4>
                <div className="relative w-28 h-28">
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
                    <span className="text-3xl font-extrabold text-white">{score}</span>
                    <span className="text-[10px] text-white/40">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest mt-4 px-3 py-1 rounded border ${scoreBorderClass} ${scoreColorClass} bg-white/5`}>
                  {scoreText}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Files Scanned */}
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-blue/10 text-neon-blue">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/50 tracking-wider">Files Scanned</p>
                    <p className="text-lg font-bold text-white mt-0.5">{healthData.files_scanned}</p>
                  </div>
                </div>

                {/* Threats Prevented */}
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/50 tracking-wider">Threats Prevented</p>
                    <p className="text-lg font-bold text-white mt-0.5">{healthData.threats_prevented}</p>
                  </div>
                </div>

                {/* Most Common Threat */}
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-alert-red/10 text-alert-red">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/50 tracking-wider">Most Common Threat</p>
                    <p className="text-md font-bold text-white truncate max-w-[150px] mt-0.5" title={healthData.most_common_threat}>
                      {healthData.most_common_threat}
                    </p>
                  </div>
                </div>

                {/* Last Scan */}
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-purple/10 text-neon-purple">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/50 tracking-wider">Last Scan</p>
                    <p className="text-sm font-bold text-white mt-0.5">{healthData.last_scan}</p>
                  </div>
                </div>

                {/* Monthly Progress */}
                <div className="sm:col-span-2 flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    healthData.monthly_progress.startsWith('↑') ? 'bg-green-500/10 text-green-400' : 'bg-alert-red/10 text-alert-red'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/50 tracking-wider">Monthly Progress</p>
                    <p className={`text-sm font-bold mt-0.5 ${
                      healthData.monthly_progress.startsWith('↑') ? 'text-green-400' : 'text-alert-red'
                    }`}>
                      {healthData.monthly_progress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-6 border-t border-white/5 pt-5">
              <h4 className="text-xs uppercase text-neon-blue/80 tracking-widest font-mono mb-3 flex items-center">
                <span className="mr-1.5">⚡</span> Recommended Security Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {healthData.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-start space-x-2 text-xs text-white/80 hover:border-neon-blue/20 transition-all duration-300">
                    <span className="text-neon-blue mt-0.5">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel col-span-1 lg:col-span-2 h-72">
              <Line options={lineOptions} data={threatData} />
            </div>
            <div className="glass-panel flex flex-col justify-center h-72">
              <Doughnut options={doughnutOptions} data={riskData} />
            </div>
          </div>

          {/* Activity Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logins Bar Chart */}
            <div className="glass-panel-purple h-80 flex flex-col justify-between">
              <Bar options={barOptions} data={loginData} />
            </div>
            
            {/* Recent Alerts */}
            <div className="glass-panel lg:col-span-1 border-alert-red/35 flex flex-col max-h-80 overflow-hidden">
              <h3 className="text-md font-bold text-alert-red mb-4 uppercase tracking-wider border-b border-alert-red/25 pb-2">Recent Security Alerts</h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {data.recent_alerts.length === 0 ? (
                  <p className="text-white/40 text-xs italic text-center py-10">No recent alerts.</p>
                ) : (
                  data.recent_alerts.map(alert => (
                    <div key={alert.id} className="p-3 border border-alert-red/20 rounded-lg bg-alert-red/5 text-xs hover:border-alert-red/55 transition-all duration-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-alert-red uppercase tracking-wider">{alert.title}</span>
                        <span className="text-[10px] text-white/50">{new Date(alert.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">{alert.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent File Scans */}
            <div className="glass-panel lg:col-span-1 border-neon-purple/35 flex flex-col max-h-80 overflow-hidden">
              <h3 className="text-md font-bold text-neon-purple mb-4 uppercase tracking-wider border-b border-neon-purple/25 pb-2">Recent File Scans</h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {data.recent_scans.length === 0 ? (
                  <p className="text-white/40 text-xs italic text-center py-10">No recent scans.</p>
                ) : (
                  data.recent_scans.map(scan => (
                    <div key={scan.id} className="flex justify-between items-center p-2.5 border-b border-neon-purple/10 last:border-0 text-xs hover:bg-neon-purple/5 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-white/80 font-mono truncate w-32">{scan.filename}</span>
                      </div>
                      {scan.status === 'MALWARE' || scan.status === 'MALICIOUS' ? (
                        <span className="text-alert-red text-[10px] font-bold px-2 py-0.5 bg-alert-red/10 border border-alert-red/30 rounded">MALWARE</span>
                      ) : (
                        <span className="text-green-400 text-[10px] font-bold px-2 py-0.5 bg-green-400/10 border border-green-400/30 rounded">CLEAN</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Cleaned Files Section */}
          <div className="glass-panel border-green-500/20 shadow-glow-green/5">
            <h3 className="text-lg font-bold text-green-400 mb-4 uppercase tracking-wider border-b border-green-500/20 pb-2 flex items-center">
              <span className="mr-2">🛡️</span> Recent Cleaned Files
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-neon-blue/80 font-mono text-xs uppercase">
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4 text-center">Threat Count</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_cleaned_files?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-white/40 italic">
                        No files cleaned yet.
                      </td>
                    </tr>
                  ) : (
                    data.recent_cleaned_files?.map(file => (
                      <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="py-3 px-4 font-mono text-white/90 truncate max-w-xs" title={file.filename}>
                          {file.filename}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/70">
                          {new Date(file.created_at).toLocaleDateString()} {new Date(file.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-neon-purple">
                          {file.threats_removed}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-green-500/10 border border-green-500/30 text-green-400 rounded">
                            {file.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={file.download_url}
                            download={file.filename}
                            className="inline-block px-3 py-1 bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-white rounded text-xs font-mono font-bold tracking-wider transition-all duration-300"
                          >
                            DOWNLOAD
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
