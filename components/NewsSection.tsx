
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getAINews, generateInfographic } from '../services/geminiService';
import { SavedNews, GroundingSource } from '../types';
import { RefreshCcw, ExternalLink, Plus, X, History, Calendar, Layout, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'ai_insight_news_history_v2';
const STORAGE_KEY_TOPICS = 'ai_insight_topics_v2';

const NewsSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  
  const [topics, setTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOPICS);
    return saved ? JSON.parse(saved) : ['Claude AI', 'OpenAI', 'Gemini', 'Claude Code'];
  });

  const [history, setHistory] = useState<SavedNews[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [newTopic, setNewTopic] = useState('');
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  const fetchNews = async () => {
    if (topics.length === 0) return;
    setLoading(true);
    try {
      const data = await getAINews(topics);
      const newEntry: SavedNews = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: data.text,
        sources: data.sources as GroundingSource[],
        topics: [...topics]
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 15);
      setHistory(updatedHistory);
      setViewingHistoryId(newEntry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInfographic = async (report: SavedNews) => {
    setGenLoading(true);
    try {
      // Check if user has key for Pro model
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio?.openSelectKey();
      }

      const infographicUrl = await generateInfographic(report.text);
      
      const updatedHistory = history.map(item => 
        item.id === report.id ? { ...item, infographicUrl } : item
      );
      setHistory(updatedHistory);
    } catch (err) {
      console.error(err);
      alert("Failed to generate infographic. Please check your API key.");
    } finally {
      setGenLoading(false);
    }
  };

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    if (viewingHistoryId === id) setViewingHistoryId(null);
  };

  const downloadInfographic = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-infographic-${Date.now()}.png`;
    link.click();
  };

  const activeEntry = history.find(h => h.id === (viewingHistoryId || history[0]?.id));

  return (
    <div className="pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">AI Intelligence</h1>
        <button 
          onClick={fetchNews} 
          disabled={loading || topics.length === 0}
          className="p-2.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Topic Management */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          Topics of Interest
        </h2>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <span key={topic} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
              {topic}
              <button onClick={() => removeTopic(topic)} className="hover:text-red-600 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
          {topics.length === 0 && <p className="text-sm text-slate-400">Add topics to get started...</p>}
        </div>
        <form onSubmit={addTopic} className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g. Claude Code, Robotics..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
          <button 
            type="submit" 
            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={20} />
          </button>
        </form>
      </section>

      {/* History Navigation */}
      {history.length > 0 && (
        <section className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          <div className="flex-shrink-0 flex items-center gap-2 text-slate-400 mr-1">
            <History size={18} />
          </div>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewingHistoryId(item.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                (viewingHistoryId === item.id || (!viewingHistoryId && history[0].id === item.id))
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 shadow-sm'
              }`}
            >
              <Calendar size={12} />
              {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              <span 
                onClick={(e) => deleteHistoryItem(item.id, e)} 
                className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={12} />
              </span>
            </button>
          ))}
        </section>
      )}

      {/* Main Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-slate-900 font-bold">Fetching latest AI news</p>
            <p className="text-slate-500 text-sm">Synthesizing reports for your topics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeEntry ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded inline-block">
                    Summary Report
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    {new Date(activeEntry.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {activeEntry.topics.map((t, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <article className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-ul:text-slate-600 prose-li:text-slate-600">
                <ReactMarkdown>
                  {activeEntry.text}
                </ReactMarkdown>
              </article>

              {/* Infographic Section */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layout size={16} className="text-blue-600" />
                    Visual Insight
                  </h3>
                  {!activeEntry.infographicUrl && !genLoading && (
                    <button
                      onClick={() => handleGenerateInfographic(activeEntry)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                    >
                      <Sparkles size={14} />
                      Generate Infographic
                    </button>
                  )}
                </div>

                {genLoading ? (
                  <div className="bg-slate-50 rounded-2xl p-10 flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-200">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-600">Designing infographic based on summary...</p>
                  </div>
                ) : activeEntry.infographicUrl ? (
                  <div className="space-y-4">
                    <div className="relative group rounded-2xl overflow-hidden shadow-md border border-slate-200">
                      <img src={activeEntry.infographicUrl} alt="Report Infographic" className="w-full object-cover" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => downloadInfographic(activeEntry.infographicUrl!)}
                          className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                          <Download size={20} className="text-slate-900" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
                    <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500">Transform this text into a professional infographic.</p>
                  </div>
                )}
              </div>
              
              {activeEntry.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    Verified Sources
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {activeEntry.sources.map((source: GroundingSource, i: number) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group shadow-sm"
                      >
                        <span className="text-sm text-slate-700 truncate mr-2 font-medium">{source.title}</span>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <NewspaperIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No reports yet.</p>
              <p className="text-slate-400 text-sm mt-1">Tap the refresh button to scan for news.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewspaperIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
  </svg>
);

export default NewsSection;
