
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import NewsSection from './components/NewsSection';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import { Tab } from './types';
import { ShieldCheck, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  // Initial key check
  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
          setShowKeyInfo(true);
        }
      } catch (e) {
        console.warn("Key selection API not available in this environment.");
      }
    };
    checkKey();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'news':
        return <NewsSection />;
      case 'generate':
        return <ImageGenerator />;
      case 'edit':
        return <ImageEditor />;
      default:
        return <NewsSection />;
    }
  };

  const handleOpenKeySelection = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      setShowKeyInfo(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pt-6 md:pt-10">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Insight</h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">AI Studio</p>
          </div>
        </div>
        <button 
          onClick={handleOpenKeySelection}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="API Configuration"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </main>

      {/* Global Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Key Selection Overlay (only shows if we detect no key) */}
      {showKeyInfo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Unlock Full Features</h3>
              <p className="text-slate-500 text-sm">
                To use high-quality image generation, you need to select a paid API key from your Google Cloud project.
              </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={handleOpenKeySelection}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 font-medium hover:underline"
              >
                How to set up billing?
              </a>
            </div>
            <button 
              onClick={() => setShowKeyInfo(false)}
              className="text-slate-400 text-xs hover:text-slate-600"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
