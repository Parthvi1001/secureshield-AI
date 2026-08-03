import React, { useState, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Scanner = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleaningStep, setCleaningStep] = useState('');
  const [cleanedResult, setCleanedResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null); // clear previous results
      setCleanedResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setCleanedResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const initiateScan = async () => {
    if (!file) {
      toast.error('No payload selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setCleanedResult(null);
    try {
      const res = await api.post('/scanner/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      toast.success('Scan complete.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    if (!file || !result) return;

    setCleaning(true);
    setCleanedResult(null);

    const steps = [
      "Cleaning File...",
      "Removing Threats...",
      "Securing Document...",
      "Generating Safe PDF..."
    ];

    let stepIdx = 0;
    setCleaningStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setCleaningStep(steps[stepIdx]);
      } else {
        clearInterval(stepInterval);
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scan_id', result.id);

      const res = await api.post('/scanner/clean/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // wait until the minimum time for steps has elapsed
      const remainingTime = (steps.length * 800) - (stepIdx * 800);
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      clearInterval(stepInterval);
      setCleaningStep("✅ File Successfully Cleaned");
      await new Promise(resolve => setTimeout(resolve, 800));

      setCleanedResult(res.data);
      toast.success('File remediation complete.', { icon: '🛡️' });
    } catch (err) {
      clearInterval(stepInterval);
      toast.error(err.response?.data?.error || 'Remediation failed.');
    } finally {
      setCleaning(false);
      setCleaningStep('');
    }
  };


  const getStatusColor = (classification) => {
    switch(classification) {
      case 'SAFE': return 'text-green-400 drop-shadow-[0_0_10px_#4ade80]';
      case 'SUSPICIOUS': return 'text-alert-orange drop-shadow-[0_0_10px_#ffaa00] text-amber-500';
      case 'DANGEROUS': return 'text-alert-red drop-shadow-[0_0_10px_#ff2a2a]';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Threat Scanner</h2>
      
      <div className="glass-panel max-w-4xl mx-auto">
        <div 
          className="border-2 border-dashed border-neon-blue/50 rounded-lg p-12 text-center hover:border-neon-blue hover:bg-neon-blue/5 transition-all cursor-pointer"
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <svg className="mx-auto h-12 w-12 text-neon-blue mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-xl font-bold">
            {file ? file.name : "DRAG AND DROP PAYLOAD HERE"}
          </p>
          <p className="text-sm mt-2 text-neon-blue/60">
            {file ? `${(file.size / 1024).toFixed(2)} KB` : "or click to browse local filesystem (PDF, ZIP, EXE, DOCX)"}
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.zip,.exe,.docx"
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            className="cyber-button w-64"
            onClick={initiateScan}
            disabled={loading || !file}
          >
            {loading ? 'ANALYZING...' : 'INITIATE ML SCAN'}
          </button>
        </div>
      </div>

      {cleaning && (
        <div className="glass-panel max-w-4xl mx-auto mt-8 border-neon-purple/30 text-center py-12 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-t-4 border-b-4 border-neon-purple rounded-full animate-spin"></div>
          <h3 className="text-2xl font-bold tracking-widest font-mono text-neon-purple animate-pulse">
            {cleaningStep}
          </h3>
        </div>
      )}

      {result && !cleanedResult && !cleaning && (
        <div className="glass-panel max-w-4xl mx-auto mt-8 border-neon-blue/30 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl -z-10"></div>
          
          <h3 className="text-2xl font-bold text-neon-blue mb-6 border-b border-neon-blue/20 pb-2">Analysis Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neon-blue/70">File Name</p>
                <p className="font-mono text-lg truncate" title={result.file_name}>{result.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-neon-blue/70">Extension</p>
                <p className="font-mono uppercase">{result.extension}</p>
              </div>
              <div>
                <p className="text-sm text-neon-blue/70">File Size</p>
                <p className="font-mono">{result.file_size.toLocaleString()} Bytes</p>
              </div>
              <div>
                <p className="text-sm text-neon-blue/70">SHA-256 Hash</p>
                <p className="font-mono text-xs break-all text-white/80 bg-black/40 p-2 rounded border border-white/10 mt-1">
                  {result.file_hash}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-6 border-l border-white/10 pl-8">
              <div className="text-center">
                <p className="text-sm text-neon-blue/70 mb-2">Classification</p>
                <h1 className={`text-5xl font-black uppercase tracking-widest ${getStatusColor(result.classification)}`}>
                  {result.classification}
                </h1>
              </div>
              
              <div className="text-center w-full">
                <p className="text-sm text-neon-blue/70 mb-2">Heuristic Risk Score</p>
                <div className="w-full bg-black/50 rounded-full h-4 border border-white/10 overflow-hidden relative">
                  <div 
                    className="h-full bg-neon-blue shadow-[0_0_10px_#00f3ff] transition-all duration-1000"
                    style={{ width: `${Math.min(100, result.risk_score)}%`, 
                             backgroundColor: result.risk_score > 70 ? '#ff2a2a' : result.risk_score > 30 ? '#ffaa00' : '#4ade80' }}
                  ></div>
                </div>
                <p className="text-2xl font-bold mt-2 font-mono">{result.risk_score} / 100</p>
              </div>

              {result.classification !== 'SAFE' && (
                <button
                  onClick={handleClean}
                  className="w-full bg-transparent border border-neon-purple text-neon-purple font-bold rounded-lg px-4 py-2.5 hover:bg-neon-purple/15 hover:text-white hover:shadow-glow-purple active:scale-95 transition-all duration-300 uppercase tracking-widest font-mono text-sm mt-2"
                >
                  🟢 Clean & Download
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-black/40 p-4 rounded border border-white/10 font-mono text-xs text-white/60">
            <p>{`> RAW JSON EXPORT:`}</p>
            <pre className="mt-2 text-neon-blue/80 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {cleanedResult && !cleaning && (
        <div className="glass-panel max-w-4xl mx-auto mt-8 border-green-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
          
          <h3 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-500/20 pb-2">Remediation Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-md font-bold text-neon-blue uppercase tracking-wider mb-3">Threat Status</h4>
              <div>
                <p className="text-xs text-neon-blue/70">Original File</p>
                <p className="font-mono text-sm truncate text-white/90" title={file?.name}>{file?.name}</p>
              </div>
              <div>
                <p className="text-alert-red font-bold text-sm flex items-center">
                  <span className="mr-1.5">⚠</span> Threat Detected
                </p>
                <p className="text-xs text-white/60 font-mono mt-0.5">Risk Level: {result?.classification}</p>
              </div>
              
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <p className="text-xs font-bold text-neon-purple">Threats Removed: {cleanedResult.threats_removed}</p>
                {cleanedResult.javascript_removed && (
                  <p className="text-xs text-green-400 flex items-center font-mono">
                    <span className="mr-1.5">✔</span> Malicious JavaScript Removed
                  </p>
                )}
                {cleanedResult.hyperlinks_removed && (
                  <p className="text-xs text-green-400 flex items-center font-mono">
                    <span className="mr-1.5">✔</span> Dangerous Hyperlink Removed
                  </p>
                )}
                {cleanedResult.embedded_objects_removed && (
                  <p className="text-xs text-green-400 flex items-center font-mono">
                    <span className="mr-1.5">✔</span> Suspicious Embedded Object Removed
                  </p>
                )}
                {cleanedResult.metadata_removed && (
                  <p className="text-xs text-green-400 flex items-center font-mono">
                    <span className="mr-1.5">✔</span> Malicious Metadata Removed
                  </p>
                )}
                {!cleanedResult.javascript_removed && !cleanedResult.hyperlinks_removed && !cleanedResult.embedded_objects_removed && !cleanedResult.metadata_removed && (
                  <p className="text-xs text-green-400 flex items-center font-mono">
                    <span className="mr-1.5">✔</span> Malware Signatures Purged
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-6 border-l border-white/10 pl-8 text-center">
              <div>
                <p className="text-xs text-neon-blue/70 mb-1">File Status</p>
                <h1 className="text-4xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_#4ade80]">
                  ✅ SECURE
                </h1>
              </div>
              
              <a 
                href={cleanedResult.download_url} 
                download={cleanedResult.file_name}
                className="w-full text-center bg-transparent border border-green-400 text-green-400 font-bold rounded-lg px-4 py-2.5 hover:bg-green-400/15 hover:text-white hover:shadow-[0_0_10px_#4ade80] active:scale-95 transition-all duration-300 uppercase tracking-widest font-mono text-xs"
              >
                Download Clean PDF
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Scanner;
