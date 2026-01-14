
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageSize } from '../types';
import { Download, Sparkles, LayoutGrid } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Check if user has key for Pro model
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio?.openSelectKey();
        // Proceeding after dialog as per guidelines
      }

      const imageUrl = await generateImage(prompt, size);
      setResultImage(imageUrl);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key configuration required. Please re-select your key.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        setError("Failed to generate image. Try a different prompt.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `ai-gen-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nano Banana Pro</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">What do you want to create?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A surreal landscape with floating islands and purple waterfalls..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-32 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Quality & Size</label>
          <div className="grid grid-cols-3 gap-3">
            {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-2 rounded-lg border transition-all text-sm font-medium ${
                  size === s
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Image
            </>
          )}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {resultImage && (
          <div className="mt-8 space-y-4">
            <div className="relative group rounded-xl overflow-hidden shadow-lg aspect-square">
              <img src={resultImage} alt="Generated result" className="w-full h-full object-cover" />
              <button
                onClick={downloadImage}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <Download size={20} className="text-slate-900" />
              </button>
            </div>
            <p className="text-xs text-center text-slate-400">Long press image to save on mobile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
