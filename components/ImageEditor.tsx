
import React, { useState, useRef } from 'react';
import { editImage, fileToDataUrl } from '../services/geminiService';
import { Upload, Wand2, RefreshCw, X } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataUrl(file);
      setSourceImage(dataUrl);
      setResultImage(null);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await editImage(sourceImage, editPrompt);
      setResultImage(result);
    } catch (err) {
      console.error(err);
      alert("Editing failed. Make sure your prompt is descriptive.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSourceImage(null);
    setResultImage(null);
    setEditPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nano Banana Edit</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        {!sourceImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Upload a photo</p>
              <p className="text-sm text-slate-500">to start editing</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video md:aspect-auto">
              <img 
                src={resultImage || sourceImage} 
                className="w-full max-h-[400px] object-contain mx-auto" 
                alt="Source" 
              />
              <button 
                onClick={clear}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70"
              >
                <X size={18} />
              </button>
              {loading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-bold text-slate-900">Magical things happening...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">What would you like to change?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder='e.g., "Add a retro filter", "Remove the person"'
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
                <button
                  onClick={handleEdit}
                  disabled={loading || !editPrompt.trim()}
                  className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Wand2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Add a retro filter", "Make it black and white", "Enhance details", "Cartoon style"].map(p => (
                <button
                  key={p}
                  onClick={() => setEditPrompt(p)}
                  className="text-xs py-1.5 px-3 bg-slate-100 text-slate-700 font-medium rounded-full border border-slate-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200 transition-colors shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
