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
import toast from 'react-hot-toast';

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

const History = () => {
  // Main login history data state
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minThreat, setMinThreat] = useState(0);
  const [maxThreat, setMaxThreat] = useState(1);
  const [countryFilter, setCountryFilter] = useState('');
  const [browserFilter, setBrowserFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');

  // Stats for charts & options state
  const [stats, setStats] = useState({
    total_logins: 0,
    status_distribution: { success: 0, failed: 0, suspicious: 0 },
    countries: [],
    browsers: [],
    devices: [],
    timeline: [],
    filter_options: { countries: [], browsers: [], devices: [] }
  });

  // Fetch stats (once, and refresh on mutations if any)
  const fetchStats = async () => {
    try {
      const res = await api.get('/history/stats/');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  };

  // Fetch paginated history list
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/history/', {
        params: {
          page,
          page_size: pageSize,
          search,
          status: statusFilter,
          min_threat_score: minThreat,
          max_threat_score: maxThreat,
          country: countryFilter,
          browser: browserFilter,
          device: deviceFilter
        }
      });
      setLogs(res.data.results);
      setCount(res.data.count);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Failed to load login history", err);
      toast.error("Failed to fetch login history records.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run queries when page or filters change
  useEffect(() => {
    fetchHistory();
  }, [page, pageSize, statusFilter, minThreat, maxThreat, countryFilter, browserFilter, deviceFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchHistory();
      fetchStats();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // CSV Exporter
  const handleExportCSV = async () => {
    try {
      toast.loading("Preparing CSV download...", { id: 'csv-export' });
      const res = await api.get('/history/', {
        params: {
          search,
          status: statusFilter,
          min_threat_score: minThreat,
          max_threat_score: maxThreat,
          country: countryFilter,
          browser: browserFilter,
          device: deviceFilter,
          export: 'csv'
        },
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `login_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("CSV file downloaded successfully!", { id: 'csv-export' });
    } catch (err) {
      console.error("Failed to export CSV", err);
      toast.error("Failed to export CSV file.", { id: 'csv-export' });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setMinThreat(0);
    setMaxThreat(1);
    setCountryFilter('');
    setBrowserFilter('');
    setDeviceFilter('');
    setPage(1);
    toast.success("Filters cleared.");
  };

  // Chart configs
  const doughnutData = {
    labels: ['Safe Success', '2FA Blocked (Suspicious)', 'Failed Attempts'],
    datasets: [{
      data: [
        stats.status_distribution.success,
        stats.status_distribution.suspicious,
        stats.status_distribution.failed
      ],
      backgroundColor: ['#00f3ff', '#b535f6', '#ff2a2a'],
      borderWidth: 1,
      borderColor: '#18181b'
    }]
  };

  const lineData = {
    labels: stats.timeline.map(t => t.date),
    datasets: [
      {
        label: 'Safe',
        data: stats.timeline.map(t => t.success),
        borderColor: '#00f3ff',
        backgroundColor: 'rgba(0, 243, 255, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Suspicious',
        data: stats.timeline.map(t => t.suspicious),
        borderColor: '#b535f6',
        backgroundColor: 'rgba(181, 53, 246, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Failed',
        data: stats.timeline.map(t => t.failed),
        borderColor: '#ff2a2a',
        backgroundColor: 'rgba(255, 42, 42, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const countryBarData = {
    labels: stats.countries.map(c => c.country || 'Unknown'),
    datasets: [{
      label: 'Logins',
      data: stats.countries.map(c => c.count),
      backgroundColor: '#00f3ff',
      borderColor: '#00f3ff',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#00f3ff', font: { size: 10 } } },
    },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } },
      y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 9 } } }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Login History & Audit Logs</h2>
          <p className="text-sm text-neon-blue/70">Analyze user telemetry, system status, and machine learning threat scores.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="cyber-btn md:w-auto px-6 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats & Charts Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart */}
        <div className="glass-panel flex flex-col items-center justify-between min-h-[300px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neon-blue border-b border-neon-blue/20 pb-2 w-full text-center">Threat Profile</h3>
          <div className="w-full h-56 mt-4 relative flex items-center justify-center">
            {stats.total_logins > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } } }
                }}
              />
            ) : isLoading ? (
              <div className="w-full h-full rounded-lg skeleton-loader"></div>
            ) : (
              <span className="text-white/40 italic">No telemetry logged.</span>
            )}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="glass-panel col-span-1 lg:col-span-2 flex flex-col justify-between min-h-[300px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neon-blue border-b border-neon-blue/20 pb-2 w-full">Activity Timeline (Last 14 Days)</h3>
          <div className="w-full h-56 mt-4">
            {stats.timeline.length > 0 ? (
              <Line data={lineData} options={chartOptions} />
            ) : isLoading ? (
              <div className="w-full h-full rounded-lg skeleton-loader"></div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40 italic">No timeline data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-neon-blue/20 pb-2">
          <h3 className="text-md font-bold uppercase tracking-widest text-neon-blue">Filters & Controls</h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-alert-red hover:underline uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs uppercase text-white/60 mb-1">Search IP / Region</label>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cyber-input text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs uppercase text-white/60 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="cyber-input text-sm bg-cyber-black text-neon-blue"
            >
              <option value="">ALL STATUSES</option>
              <option value="success">SUCCESS</option>
              <option value="failed">FAILED</option>
              <option value="suspicious">SUSPICIOUS (2FA REQ)</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs uppercase text-white/60 mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
              className="cyber-input text-sm bg-cyber-black text-neon-blue"
            >
              <option value="">ALL COUNTRIES</option>
              {stats.filter_options.countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Browser */}
          <div>
            <label className="block text-xs uppercase text-white/60 mb-1">Browser</label>
            <select
              value={browserFilter}
              onChange={(e) => { setBrowserFilter(e.target.value); setPage(1); }}
              className="cyber-input text-sm bg-cyber-black text-neon-blue"
            >
              <option value="">ALL BROWSERS</option>
              {stats.filter_options.browsers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Threat Score Slider */}
        <div className="pt-2 border-t border-neon-blue/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>ML Threat Score Threshold:</span>
              <span className="text-neon-blue font-mono font-bold">{(minThreat * 100).toFixed(0)}% - {(maxThreat * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minThreat}
                onChange={(e) => { setMinThreat(parseFloat(e.target.value)); setPage(1); }}
                className="w-full accent-neon-blue cursor-pointer h-1 bg-cyber-black rounded-lg appearance-none"
              />
              <span className="text-xs text-white/40">to</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={maxThreat}
                onChange={(e) => { setMaxThreat(parseFloat(e.target.value)); setPage(1); }}
                className="w-full accent-neon-blue cursor-pointer h-1 bg-cyber-black rounded-lg appearance-none"
              />
            </div>
          </div>
          <div className="text-xs text-white/40 italic">
            Showing {logs.length} of {count} logs.
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel overflow-x-auto min-h-[350px] relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neon-blue/50 text-xs font-semibold tracking-wider text-neon-blue">
              <th className="p-3">TIME</th>
              <th className="p-3">COUNTRY</th>
              <th className="p-3">IP ADDRESS</th>
              <th className="p-3">BROWSER</th>
              <th className="p-3">DEVICE</th>
              <th className="p-3">THREAT SCORE</th>
              <th className="p-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neon-blue/10">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="border-b border-neon-blue/10 animate-pulse">
                  <td className="p-3"><div className="h-4 bg-white/10 rounded skeleton-loader w-24"></div></td>
                  <td className="p-3"><div className="h-4 bg-white/10 rounded skeleton-loader w-16"></div></td>
                  <td className="p-3"><div className="h-4 bg-white/10 rounded skeleton-loader w-28"></div></td>
                  <td className="p-3"><div className="h-4 bg-white/10 rounded skeleton-loader w-20"></div></td>
                  <td className="p-3"><div className="h-4 bg-white/10 rounded skeleton-loader w-20"></div></td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-white/10 rounded skeleton-loader w-8"></div>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden w-12"></div>
                    </div>
                  </td>
                  <td className="p-3 text-right"><div className="h-5 bg-white/10 rounded skeleton-loader w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-white/50 italic">
                  No authentication logs match the current query criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                let statusBadge;
                if (!log.is_success) {
                  statusBadge = (
                    <span className="px-2 py-1 text-xs font-bold bg-alert-red/20 text-alert-red border border-alert-red/40 rounded drop-shadow-[0_0_5px_rgba(255,42,42,0.3)]">
                      FAILED
                    </span>
                  );
                } else if (log.threat_score >= 0.5) {
                  statusBadge = (
                    <span className="px-2 py-1 text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">
                      2FA BLOCKED
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40 rounded drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">
                      SUCCESS
                    </span>
                  );
                }

                // Color-code threat score
                let threatColor = "text-green-400";
                if (log.threat_score >= 0.8) threatColor = "text-alert-red font-bold";
                else if (log.threat_score >= 0.5) threatColor = "text-yellow-400 font-bold";
                else if (log.threat_score >= 0.2) threatColor = "text-neon-purple";

                return (
                  <tr key={log.id} className="hover:bg-neon-blue/5 transition-all duration-150">
                    <td className="p-3 text-xs text-white/80 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-white font-medium">
                      {log.country || 'Unknown'}
                    </td>
                    <td className="p-3 text-sm font-mono text-neon-blue">
                      {log.ip_address}
                    </td>
                    <td className="p-3 text-xs text-white/70 whitespace-nowrap">
                      {log.browser}
                    </td>
                    <td className="p-3 text-xs text-white/70 whitespace-nowrap">
                      {log.device}
                    </td>
                    <td className="p-3 text-sm font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={threatColor}>{(log.threat_score * 100).toFixed(1)}%</span>
                        <div className="w-12 bg-cyber-black h-1 rounded border border-white/10 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${
                              log.threat_score >= 0.8 ? 'bg-alert-red' :
                              log.threat_score >= 0.5 ? 'bg-yellow-400' :
                              'bg-neon-blue'
                            }`}
                            style={{ width: `${log.threat_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-right whitespace-nowrap">
                      {statusBadge}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neon-blue/20">
        <div className="flex items-center space-x-2 text-xs text-white/60">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
            className="bg-cyber-black border border-neon-blue/30 rounded px-2 py-1 text-neon-blue focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-3 py-1.5 border border-neon-blue/30 text-neon-blue rounded text-xs hover:bg-neon-blue/10 hover:shadow-glow-blue transition-all disabled:opacity-45 disabled:hover:bg-transparent"
          >
            PREVIOUS
          </button>
          <span className="text-xs font-mono text-white/80">
            PAGE {page} OF {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="px-3 py-1.5 border border-neon-blue/30 text-neon-blue rounded text-xs hover:bg-neon-blue/10 hover:shadow-glow-blue transition-all disabled:opacity-45 disabled:hover:bg-transparent"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
