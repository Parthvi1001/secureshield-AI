import React, { useState, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Scanner = () => {
  const [scanQueue, setScanQueue] = useState([]);
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const fileInputRef = useRef(null);

  const addFilesToQueue = (fileList) => {
    const newItems = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      loading: false,
      result: null,
      cleaning: false,
      cleaningStep: '',
      cleanedResult: null,
      error: null
    }));
    setScanQueue(prev => [...prev, ...newItems]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
      e.target.value = null; // clear input
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (id) => {
    setScanQueue(prev => prev.filter(item => item.id !== id));
    if (expandedFileId === id) setExpandedFileId(null);
  };

  const clearQueue = () => {
    setScanQueue([]);
    setExpandedFileId(null);
  };

  const scanIndividualFile = async (id) => {
    const item = scanQueue.find(x => x.id === id);
    if (!item || item.loading) return;

    setScanQueue(prev => prev.map(x => x.id === id ? { ...x, loading: true, error: null, result: null, cleanedResult: null } : x));

    const formData = new FormData();
    formData.append('file', item.file);

    try {
      const res = await api.post('/scanner/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setScanQueue(prev => prev.map(x => x.id === id ? { ...x, loading: false, result: res.data } : x));
      toast.success(`Scan complete for ${item.file.name}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Scan failed.';
      setScanQueue(prev => prev.map(x => x.id === id ? { ...x, loading: false, error: errMsg } : x));
      toast.error(`Failed to scan ${item.file.name}: ${errMsg}`);
    }
  };

  const scanAllPending = async () => {
    const pendingItems = scanQueue.filter(x => !x.result && !x.loading);
    if (pendingItems.length === 0) {
      toast.error('No pending files to scan.');
      return;
    }

    setIsBatchScanning(true);
    toast.loading(`Initiating batch scan for ${pendingItems.length} file(s)...`, { id: 'batch-toast' });

    await Promise.all(pendingItems.map(item => scanIndividualFile(item.id)));

    toast.success('Batch scan session complete.', { id: 'batch-toast' });
    setIsBatchScanning(false);
  };

  const cleanIndividualFile = async (id) => {
    const item = scanQueue.find(x => x.id === id);
    if (!item || !item.result || item.cleaning) return;

    setScanQueue(prev => prev.map(x => x.id === id ? { ...x, cleaning: true, cleaningStep: 'Cleaning File...' } : x));

    const steps = [
      "Cleaning File...",
      "Removing Threats...",
      "Securing Document...",
      "Generating Safe PDF..."
    ];

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setScanQueue(prev => prev.map(x => x.id === id ? { ...x, cleaningStep: steps[stepIdx] } : x));
      } else {
        clearInterval(stepInterval);
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('scan_id', item.result.id);

      const res = await api.post('/scanner/clean/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const remainingTime = (steps.length * 800) - (stepIdx * 800);
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      clearInterval(stepInterval);
      setScanQueue(prev => prev.map(x => x.id === id ? { ...x, cleaning: false, cleaningStep: '', cleanedResult: res.data } : x));
      toast.success(`Remediation complete for ${item.file.name}`, { icon: '🛡️' });
    } catch (err) {
      clearInterval(stepInterval);
      const errMsg = err.response?.data?.error || 'Remediation failed.';
      setScanQueue(prev => prev.map(x => x.id === id ? { ...x, cleaning: false, cleaningStep: '', error: errMsg } : x));
      toast.error(`Failed to remediate ${item.file.name}: ${errMsg}`);
    }
  };

  const getStatusBadge = (item) => {
    if (item.loading) {
      return <span className="text-neon-blue animate-pulse text-[10px] font-bold tracking-widest uppercase bg-neon-blue/10 border border-neon-blue/20 px-2 py-1 rounded">Scanning...</span>;
    }
    if (item.cleaning) {
      return <span className="text-neon-purple animate-pulse text-[10px] font-bold tracking-widest uppercase bg-neon-purple/10 border border-neon-purple/20 px-2 py-1 rounded">{item.cleaningStep}</span>;
    }
    if (item.cleanedResult) {
      return <span className="text-green-400 text-[10px] font-bold tracking-widest uppercase bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">🛡️ SECURED</span>;
    }
    if (item.result) {
      const classification = item.result.classification;
      if (classification === 'SAFE') {
        return <span className="text-green-400 text-[10px] font-bold tracking-widest uppercase bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">SAFE</span>;
      }
      if (classification === 'SUSPICIOUS') {
        return <span className="text-yellow-400 text-[10px] font-bold tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">SUSPICIOUS</span>;
      }
      return <span className="text-alert-red text-[10px] font-bold tracking-widest uppercase bg-alert-red/10 border border-alert-red/20 px-2 py-1 rounded">DANGEROUS</span>;
    }
    if (item.error) {
      return <span className="text-alert-red text-[10px] font-bold tracking-widest uppercase bg-alert-red/10 border border-alert-red/20 px-2 py-1 rounded">FAILED</span>;
    }
    return <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase bg-white/5 border border-white/10 px-2 py-1 rounded">PENDING</span>;
  };

  const getRiskScoreColor = (score) => {
    if (score > 70) return 'bg-alert-red';
    if (score > 30) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Multi-Threat Scanner</h2>
          <p className="text-sm text-neon-blue/70">Upload multiple files and analyze heuristic risk and machine learning classifications concurrently.</p>
        </div>
        {scanQueue.length > 0 && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={clearQueue}
              className="bg-white/5 border border-white/10 text-white/70 font-semibold text-xs tracking-wider uppercase rounded-lg px-4 py-2.5 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              Clear Queue
            </button>
            <button 
              onClick={scanAllPending}
              disabled={isBatchScanning || scanQueue.filter(x => !x.result && !x.loading).length === 0}
              className="cyber-button text-xs tracking-wider uppercase py-2 px-6"
            >
              Scan All Pending ({scanQueue.filter(x => !x.result && !x.loading).length})
            </button>
          </div>
        )}
      </div>
      
      {/* File Upload Dropzone */}
      <div className="glass-panel max-w-5xl mx-auto">
        <div 
          className="border-2 border-dashed border-neon-blue/50 rounded-lg p-10 text-center hover:border-neon-blue hover:bg-neon-blue/5 transition-all cursor-pointer"
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <svg className="mx-auto h-10 w-10 text-neon-blue mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-bold uppercase tracking-wider">
            DRAG AND DROP PAYLOAD(S) HERE
          </p>
          <p className="text-xs mt-2 text-neon-blue/60">
            or click to browse local files (Supports PDF, ZIP, EXE, DOCX | Multiple Select Enabled)
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.zip,.exe,.docx"
            multiple
          />
        </div>
      </div>

      {/* Upload Queue list */}
      {scanQueue.length > 0 && (
        <div className="glass-panel max-w-5xl mx-auto space-y-4">
          <h3 className="text-md font-bold text-neon-blue uppercase tracking-widest border-b border-neon-blue/20 pb-3">
            📁 Scan Queue ({scanQueue.length} files)
          </h3>

          <div className="divide-y divide-white/5">
            {scanQueue.map((item) => (
              <div key={item.id} className="py-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* File Info */}
                  <div className="flex items-center space-x-3 min-w-[250px] max-w-full truncate">
                    <span className="text-xl">📄</span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate max-w-[300px] sm:max-w-[450px]" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase">
                        {(item.file.size / 1024).toFixed(2)} KB • {item.file.name.split('.').pop()}
                      </p>
                    </div>
                  </div>

                  {/* Classification tag & Status gauge */}
                  <div className="flex items-center space-x-6">
                    {item.result && (
                      <div className="hidden sm:flex flex-col items-end w-32 font-mono">
                        <div className="flex items-center space-x-2 text-[10px] text-white/50 mb-1">
                          <span>Risk:</span>
                          <span className="font-bold text-white">{item.result.risk_score}/100</span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded border border-white/5 overflow-hidden">
                          <div 
                            className={`h-full ${getRiskScoreColor(item.result.risk_score)}`} 
                            style={{ width: `${item.result.risk_score}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      {getStatusBadge(item)}
                    </div>
                  </div>

                  {/* Row actions */}
                  <div className="flex items-center space-x-2">
                    {/* Scan Button */}
                    {!item.result && !item.loading && (
                      <button 
                        onClick={() => scanIndividualFile(item.id)}
                        className="bg-transparent border border-neon-blue/40 text-neon-blue font-semibold text-xs tracking-wider uppercase rounded px-3 py-1.5 hover:bg-neon-blue/15 hover:border-neon-blue hover:text-white transition-all duration-300"
                      >
                        Scan
                      </button>
                    )}

                    {/* Clean Button */}
                    {item.result && item.result.classification !== 'SAFE' && !item.cleanedResult && !item.cleaning && (
                      <button 
                        onClick={() => cleanIndividualFile(item.id)}
                        className="bg-transparent border border-neon-purple/40 text-neon-purple font-semibold text-xs tracking-wider uppercase rounded px-3 py-1.5 hover:bg-neon-purple/15 hover:border-neon-purple hover:text-white transition-all duration-300"
                      >
                        Clean
                      </button>
                    )}

                    {/* Download Clean File */}
                    {item.cleanedResult && (
                      <a 
                        href={item.cleanedResult.download_url}
                        download={item.cleanedResult.file_name}
                        className="bg-transparent border border-green-400 text-green-400 font-semibold text-xs tracking-wider uppercase rounded px-3 py-1.5 hover:bg-green-400/15 hover:text-white transition-all duration-300"
                      >
                        Download
                      </a>
                    )}

                    {/* Details Toggle */}
                    {item.result && (
                      <button 
                        onClick={() => setExpandedFileId(expandedFileId === item.id ? null : item.id)}
                        className="text-white/40 hover:text-white text-xs px-2 py-1.5 transition-colors"
                        title="Toggle Analysis Details"
                      >
                        {expandedFileId === item.id ? '▲ Close Details' : '▼ Details'}
                      </button>
                    )}

                    {/* Remove from queue */}
                    <button 
                      onClick={() => removeFile(item.id)}
                      disabled={item.loading || item.cleaning}
                      className="text-alert-red/70 hover:text-alert-red font-semibold text-xs p-1.5 hover:bg-alert-red/5 rounded transition-all duration-200"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Inline error log */}
                {item.error && (
                  <div className="bg-alert-red/5 border border-alert-red/20 text-alert-red text-xs p-2.5 rounded font-mono">
                    System error: {item.error}
                  </div>
                )}

                {/* Expanded Details panel */}
                {expandedFileId === item.id && item.result && (
                  <div className="bg-black/25 p-4 rounded-lg border border-white/5 space-y-4 font-mono text-xs text-white/70">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-neon-blue font-bold uppercase tracking-wider text-[10px]">Security Metadata</h4>
                        <p><span className="text-white/40">SHA-256 Hash:</span> <span className="text-white text-[10px] break-all">{item.result.file_hash}</span></p>
                        <p><span className="text-white/40">Extension:</span> <span className="text-white">{item.result.extension}</span></p>
                        <p><span className="text-white/40">Size:</span> <span className="text-white">{item.result.file_size.toLocaleString()} Bytes</span></p>
                      </div>

                      {item.cleanedResult && (
                        <div className="space-y-2">
                          <h4 className="text-green-400 font-bold uppercase tracking-wider text-[10px]">Sanitization Details</h4>
                          <p><span className="text-white/40">Threats Removed:</span> <span className="text-green-400 font-bold">{item.cleanedResult.threats_removed}</span></p>
                          <div className="space-y-1 mt-2 text-[10px]">
                            {item.cleanedResult.javascript_removed && <p className="text-green-400/90">✓ Embedded Javascript script payloads removed</p>}
                            {item.cleanedResult.hyperlinks_removed && <p className="text-green-400/90">✓ Dangerous hyperlinks scrubbed</p>}
                            {item.cleanedResult.embedded_objects_removed && <p className="text-green-400/90">✓ Embedded OLE payloads deleted</p>}
                            {item.cleanedResult.metadata_removed && <p className="text-green-400/90">✓ Document metadata sanitization successful</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <p className="text-neon-purple font-bold uppercase tracking-wider text-[10px] mb-2">{`> Raw JSON telemetry`}</p>
                      <pre className="text-neon-blue/80 overflow-x-auto bg-black/40 p-3 rounded border border-white/5">
                        {JSON.stringify(item.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
