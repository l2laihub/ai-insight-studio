
import React from 'react';
import { Newspaper, Sparkles, Wand2 } from 'lucide-react';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50">
      <button
        onClick={() => setActiveTab('news')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'news' ? 'text-blue-600' : 'text-slate-500'
        }`}
      >
        <Newspaper size={24} />
        <span className="text-xs font-medium">News</span>
      </button>
      <button
        onClick={() => setActiveTab('generate')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'generate' ? 'text-blue-600' : 'text-slate-500'
        }`}
      >
        <Sparkles size={24} />
        <span className="text-xs font-medium">Create</span>
      </button>
      <button
        onClick={() => setActiveTab('edit')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'edit' ? 'text-blue-600' : 'text-slate-500'
        }`}
      >
        <Wand2 size={24} />
        <span className="text-xs font-medium">Edit</span>
      </button>
    </nav>
  );
};

export default Navigation;
