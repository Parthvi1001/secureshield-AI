import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const [scans, setScans] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected scan for details modal
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/history/', {
        params: {
          page,
          page_size: pageSize,
          search,
          status: statusFilter
        }
      });
      setScans(res.data.results);
      setCount(res.data.count);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Failed to load file scan history", err);
      toast.error("Failed to fetch scan history records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/history/?export=csv&search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`;
    
    // Create a temporary link to download the CSV with token authorization or direct download
    // Since it's a GET request, we can fetch it as blob or open it
    api.get('/history/', {
      params: { export: 'csv', search, status: statusFilter },
      responseType: 'blob'
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `secureshield_scan_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((err) => {
      console.error("Failed to export CSV", err);
      toast.error("Failed to export CSV.");
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CLEAN':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-green-500/10 border border-green-500/30 text-green-400">
            SAFE
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            SUSPICIOUS
          </span>
        );
      case 'MALICIOUS':
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-red-500/10 border border-red-500/30 text-red-400">
            THREAT DETECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
            PENDING
          </span>
        );
    }
  };

  const getRiskLevel = (score) => {
    if (score < 30) return { label: 'LOW', color: 'text-green-400' };
    if (score <= 70) return { label: 'MEDIUM', color: 'text-yellow-400' };
    return { label: 'HIGH', color: 'text-red-400' };
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-orbitron neon-text uppercase tracking-widest">
            SCAN HISTORY
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            VERIFIED FILE ANALYSES AND SANITIZATION TELEMETRY
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 border border-neon-blue/50 text-neon-blue font-mono rounded hover:bg-neon-blue/15 hover:shadow-glow-blue transition-all duration-300 text-xs font-bold uppercase tracking-widest flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Export CSV Log
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-mono text-neon-blue/70 mb-1.5 uppercase tracking-wider">SEARCH FILE NAME</label>
            <div className="relative">
              <input
                type="text"
                className="cyber-input pr-10"
                placeholder="Search scans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-2.5 text-neon-blue hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-[10px] font-mono text-neon-blue/70 mb-1.5 uppercase tracking-wider">CLASSIFICATION</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="cyber-input bg-cyber-dark"
            >
              <option value="">ALL ANALYSIS STATUSES</option>
              <option value="CLEAN">SAFE</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="MALICIOUS">THREAT DETECTED</option>
            </select>
          </div>
        </form>
      </div>

      {/* Scans table list */}
      <div className="glass-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-neon-blue/20 bg-neon-blue/5 text-neon-blue/80 uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">FILE NAME</th>
                <th className="px-6 py-4">TYPE</th>
                <th className="px-6 py-4">SCAN DATE</th>
                <th className="px-6 py-4">RISK LEVEL</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neon-blue/10">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 uppercase tracking-wider">
                    Querying mainframe database...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-white/50 uppercase tracking-wider">
                    No matching scan telemetry reports found.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => {
                  const risk = getRiskLevel(scan.risk_score);
                  return (
                    <tr key={scan.id} className="hover:bg-neon-blue/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
                        {scan.file_name}
                      </td>
                      <td className="px-6 py-4 text-neon-blue font-bold">
                        {scan.extension ? scan.extension.toUpperCase() : 'UNKNOWN'}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {formatDate(scan.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${risk.color}`}>
                          {risk.label} ({scan.risk_score}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(scan.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedScan(scan)}
                          className="px-3 py-1.5 border border-neon-purple/50 text-neon-purple font-mono rounded hover:bg-neon-purple/15 hover:shadow-glow-purple transition-all duration-300 text-[10px] uppercase font-bold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-neon-blue/20 bg-cyber-dark/30">
            <span className="text-[10px] text-white/50 uppercase font-mono">
              Showing page {page} of {totalPages} ({count} total records)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1 border border-neon-blue/30 text-neon-blue rounded hover:bg-neon-blue/10 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                PREV
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1 border border-neon-blue/30 text-neon-blue rounded hover:bg-neon-blue/10 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-all"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Scan Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl border-neon-blue/30 shadow-glow-blue/10 animate-fade-in relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-neon-blue/20 pb-4 mb-4">
              <h3 className="text-xl font-bold font-orbitron text-neon-blue tracking-wider uppercase">
                Analysis Telemetry Report
              </h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 font-mono text-xs text-white/90">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">File Name</span>
                  <span className="text-sm font-bold text-white block break-all">{selectedScan.file_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">SHA-256 Hash</span>
                  <span className="text-[11px] text-white/80 block break-all">{selectedScan.file_hash}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">Size</span>
                  <span className="text-sm text-white block">{formatBytes(selectedScan.file_size)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">Format</span>
                  <span className="text-sm text-white block">{selectedScan.extension ? selectedScan.extension.toUpperCase() : 'UNKNOWN'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">Threat Family</span>
                  <span className="text-sm text-white block">{selectedScan.malware_family || 'NONE'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neon-blue/50 uppercase block">Scan Classification</span>
                  <span className="block mt-0.5">{getStatusBadge(selectedScan.status)}</span>
                </div>
              </div>

              {/* Threat Score Bar */}
              <div className="border border-neon-blue/20 bg-neon-blue/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-neon-blue/70 uppercase">Heuristic Risk Score</span>
                  <span className="text-sm font-bold text-white">{selectedScan.risk_score}%</span>
                </div>
                <div className="h-2 w-full bg-cyber-dark/80 rounded border border-neon-blue/20 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedScan.risk_score < 30
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                        : selectedScan.risk_score <= 70
                        ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    }`}
                    style={{ width: `${selectedScan.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Remediation Details */}
              {selectedScan.download_url && (
                <div className="border border-neon-purple/20 bg-neon-purple/5 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neon-purple uppercase tracking-wider">Remediation Diagnostics</span>
                    <a
                      href={selectedScan.download_url}
                      className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 text-neon-purple rounded hover:bg-neon-purple/30 transition-all font-bold text-[10px] uppercase shadow-glow-purple/20"
                      download
                    >
                      Download Disarmed File
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70">
                    <div className="flex justify-between border-b border-neon-purple/10 py-1">
                      <span>Threats Removed:</span>
                      <span className="text-neon-purple font-bold">{selectedScan.threats_removed}</span>
                    </div>
                    <div className="flex justify-between border-b border-neon-purple/10 py-1">
                      <span>JS Elements Stripped:</span>
                      <span className={selectedScan.javascript_removed ? 'text-green-400 font-bold' : 'text-white/40'}>
                        {selectedScan.javascript_removed ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-neon-purple/10 py-1">
                      <span>Hyperlinks Purged:</span>
                      <span className={selectedScan.hyperlinks_removed ? 'text-green-400 font-bold' : 'text-white/40'}>
                        {selectedScan.hyperlinks_removed ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-neon-purple/10 py-1">
                      <span>Metadata Sanitized:</span>
                      <span className={selectedScan.metadata_removed ? 'text-green-400 font-bold' : 'text-white/40'}>
                        {selectedScan.metadata_removed ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 mt-6 border-t border-neon-blue/20">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-cyber-dark/80 border border-neon-blue/30 text-neon-blue rounded hover:bg-neon-blue/15 hover:text-white transition-all uppercase tracking-wider text-xs font-bold"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
