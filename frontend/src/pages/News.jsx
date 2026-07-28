import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ['All', 'Malware', 'Phishing', 'Data Breach', 'Cyber Attack', 'General'];

  const fetchNews = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await api.get('/news/', {
        params: {
          page: page,
          search: search,
          category: category
        }
      });
      setArticles(res.data.results);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      if (!isAutoRefresh) toast.error('Failed to load intelligence feed.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, search, category]);

  // Initial load and dependency changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto Refresh Interval (60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews(true); // silent refresh
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset to page 1 on new search
    fetchNews();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1); // reset to page 1 on filter change
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Global Intelligence Feed</h2>
        {isRefreshing && <span className="text-neon-blue text-sm animate-pulse">Syncing...</span>}
      </div>
      
      {/* Search and Filters */}
      <div className="glass-panel">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="w-full md:w-1/2 flex gap-2">
            <input 
              type="text" 
              placeholder="Search threat intelligence..." 
              className="cyber-input flex-grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="cyber-button w-24">Search</button>
          </form>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1 text-sm rounded uppercase tracking-wider transition-all ${
                category === cat 
                  ? 'bg-neon-blue text-black font-bold shadow-glow-blue' 
                  : 'bg-black/40 text-neon-blue/70 border border-neon-blue/30 hover:border-neon-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-20 text-neon-blue animate-pulse font-mono">ESTABLISHING UPLINK...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-white/50 font-mono">NO INTEL MATCHING PARAMETERS FOUND.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <a 
              key={article.id} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-panel hover:-translate-y-1 transition-transform group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-2 py-1 bg-neon-purple/20 text-neon-purple rounded">
                  {article.category || 'INTEL'}
                </span>
                <span className="text-xs text-white/50 font-mono">
                  {new Date(article.published_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-neon-blue transition-colors flex-grow">
                {article.title}
              </h3>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-neon-blue/70 font-mono">{article.source}</span>
                <svg className="w-4 h-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8 glass-panel py-3 max-w-sm mx-auto">
          <button 
            className="text-neon-blue hover:text-white disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            &lt; PREV
          </button>
          <span className="font-mono text-white/70">
            PAGE {page} / {totalPages}
          </span>
          <button 
            className="text-neon-blue hover:text-white disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            NEXT &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
