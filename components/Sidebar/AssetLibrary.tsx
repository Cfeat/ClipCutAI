import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Asset } from '../../types';
import * as GeminiService from '../../services/geminiService';
import { generateImage, generateVideo, generateScript } from '../../services/geminiService';

interface AssetLibraryProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onAddAsset, onDragStart }) => {
  const [activeTab, setActiveTab] = useState<'media' | 'ai'>('media');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMode, setGenMode] = useState<'image' | 'video' | 'script'>('image');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      onAddAsset({
        id: crypto.randomUUID(),
        type,
        url,
        name: file.name
      });
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      // API Key Check for Veo
      if (genMode === 'video') {
         const hasKey = await GeminiService.checkApiKey();
         if (!hasKey) {
             await GeminiService.promptForKey();
             // Assuming key selected, or user will try again.
             // In a real app we might await a callback or poll.
             // We'll proceed optimistically or catch the error.
         }
      }

      if (genMode === 'image') {
        const base64Image = await generateImage(prompt);
        // Convert data URL to blob URL for consistency
        const res = await fetch(base64Image);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        const newAsset: Asset = {
          id: crypto.randomUUID(),
          type: 'image',
          url,
          name: `AI: ${prompt.slice(0, 15)}...`
        };
        onAddAsset(newAsset);
      } else if (genMode === 'video') {
        const videoUrl = await generateVideo(prompt);
        const newAsset: Asset = {
            id: crypto.randomUUID(),
            type: 'video',
            url: videoUrl,
            name: `Veo: ${prompt.slice(0, 15)}...`
        };
        onAddAsset(newAsset);
      } else {
          // Script
          const script = await generateScript(prompt);
          setGeneratedResult(script);
      }
    } catch (error) {
      console.error("Generation failed", error);
      alert("Generation failed. Check console for details or ensure API Key is valid.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 w-80">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-xs font-medium ${activeTab === 'media' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Media
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-xs font-medium ${activeTab === 'ai' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          AI Generator
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'media' && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="UploadCloud" className="w-8 h-8 mb-3 text-zinc-500" />
                    <p className="text-xs text-zinc-500">Click to upload video/image</p>
                </div>
                <input type="file" className="hidden" accept="video/*,image/*" onChange={handleFileUpload} />
            </label>

            <div className="grid grid-cols-2 gap-2">
              {assets.map(asset => (
                <div 
                  key={asset.id} 
                  draggable
                  onDragStart={(e) => onDragStart(e, asset)}
                  className="aspect-square bg-zinc-800 rounded overflow-hidden cursor-grab active:cursor-grabbing border border-zinc-700 hover:border-zinc-500 relative group"
                >
                  {asset.type === 'video' ? (
                    <video src={asset.url} className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover pointer-events-none" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 truncate text-[10px] text-zinc-300">
                    {asset.name}
                  </div>
                  {/* Plus icon on hover to quick add */}
                   <button 
                     onClick={() => { /* Quick add logic handled by drag drop mostly */ }}
                     className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-teal-600 text-white p-1 rounded-full shadow-lg"
                   >
                     <Icon name="Plus" size={12} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
             <div className="flex gap-2 mb-4">
                 {(['image', 'video', 'script'] as const).map(m => (
                     <button 
                        key={m}
                        onClick={() => setGenMode(m)}
                        className={`px-3 py-1 text-[10px] rounded-full capitalize ${genMode === m ? 'bg-teal-900 text-teal-200 border border-teal-700' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                     >
                        {m}
                     </button>
                 ))}
             </div>

             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder={`Describe the ${genMode} you want...`}
               className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded p-3 text-sm text-zinc-200 focus:outline-none focus:border-teal-500 resize-none"
             />

             <button
               disabled={isGenerating || !prompt}
               onClick={handleGenerate}
               className="w-full py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xs font-bold rounded shadow-lg hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
                {isGenerating ? <Icon name="Loader2" className="animate-spin" size={14} /> : <Icon name="Sparkles" size={14} />}
                Generate with Gemini
             </button>

             {genMode === 'script' && generatedResult && (
                 <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-xs text-zinc-300 whitespace-pre-wrap">
                     {generatedResult}
                     <button 
                        className="mt-2 text-teal-400 hover:underline block text-[10px]"
                        onClick={() => navigator.clipboard.writeText(generatedResult)}
                     >
                        Copy to clipboard
                     </button>
                 </div>
             )}

             <div className="mt-8 p-3 bg-blue-900/20 border border-blue-900/50 rounded">
                 <h4 className="text-[10px] font-bold text-blue-300 mb-1 flex items-center gap-1">
                     <Icon name="Info" size={10} />
                     Gemini & Veo Models
                 </h4>
                 <p className="text-[10px] text-blue-200/70 leading-relaxed">
                     Uses <strong>gemini-2.5-flash-image</strong> for images and <strong>veo-3.1-fast</strong> for videos. 
                     Video generation requires a paid API key.
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1">Billing Docs</a>
                 </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetLibrary;
