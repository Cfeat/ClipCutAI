import React, { useState, useCallback } from 'react';
import { ProjectState, Clip, Track, Asset, ClipType } from './types';
import { DEFAULT_TRACKS, TIMELINE_ZOOM_DEFAULT } from './constants';
import Timeline from './components/Timeline/Timeline';
import Player from './components/Player';
import AssetLibrary from './components/Sidebar/AssetLibrary';
import PropertiesPanel from './components/Sidebar/PropertiesPanel';
import { Icon } from './components/Icon';
import * as GeminiService from './services/geminiService';

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>({
    tracks: [...DEFAULT_TRACKS],
    clips: [],
    duration: 300, // 5 minutes default workspace
    currentTime: 0,
    isPlaying: false,
    selectedClipId: null,
    zoom: TIMELINE_ZOOM_DEFAULT
  });

  const [assets, setAssets] = useState<Asset[]>([]);

  // State Updates
  const updateProject = (updates: Partial<ProjectState>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setProject(prev => ({ ...prev, currentTime: time }));
  }, []);

  const handleTogglePlay = useCallback(() => {
    setProject(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  // Add Clip Logic
  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('asset', JSON.stringify(asset));
  };

  const handleDropOnTimeline = (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('asset');
      if (!data) return;
      const asset = JSON.parse(data) as Asset;

      // Simple drop logic: Add to first compatible track at current playhead for MVP
      // In a real app, calculate drop X/Y to find exact track and time
      const targetTrack = project.tracks.find(t => 
        (asset.type === 'video' && t.type === 'video') || 
        (asset.type === 'image' && t.type === 'video') // Images go on video tracks
      );

      if (targetTrack) {
          const newClip: Clip = {
              id: crypto.randomUUID(),
              trackId: targetTrack.id,
              type: asset.type === 'video' ? ClipType.VIDEO : ClipType.IMAGE,
              src: asset.url,
              name: asset.name,
              startTime: project.currentTime,
              duration: 5, // Default duration
              offset: 0,
              properties: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 }
          };
          setProject(prev => ({
              ...prev,
              clips: [...prev.clips, newClip],
              selectedClipId: newClip.id
          }));
      }
  };

  const handleUpdateClip = (id: string, updates: Partial<Clip>) => {
      setProject(prev => ({
          ...prev,
          clips: prev.clips.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
  };

  const handleDeleteClip = (id: string) => {
      setProject(prev => ({
          ...prev,
          clips: prev.clips.filter(c => c.id !== id),
          selectedClipId: null
      }));
  };

  // Add Text Helper
  const handleAddText = () => {
      const textTrack = project.tracks.find(t => t.type === 'text');
      if (!textTrack) return;
      
      const newClip: Clip = {
          id: crypto.randomUUID(),
          trackId: textTrack.id,
          type: ClipType.TEXT,
          content: "New Text",
          name: "Text Overlay",
          startTime: project.currentTime,
          duration: 3,
          offset: 0,
          properties: { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 }
      };
      setProject(prev => ({
          ...prev,
          clips: [...prev.clips, newClip],
          selectedClipId: newClip.id
      }));
  };

  const selectedClip = project.clips.find(c => c.id === project.selectedClipId);

  return (
    <div 
        className="h-screen w-screen flex flex-col bg-black text-zinc-200 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnTimeline}
    >
      {/* Header */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Icon name="Scissors" className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">ClipCut <span className="text-teal-400">AI</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 px-3 py-1 bg-zinc-800 rounded border border-zinc-700">
                {project.clips.length} Clips • {Math.floor(project.duration / 60)}m Timeline
            </span>
            <button className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-teal-900/50 flex items-center gap-2">
                <Icon name="Download" size={14} />
                Export
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Assets) */}
        <AssetLibrary 
            assets={assets} 
            onAddAsset={handleAddAsset} 
            onDragStart={handleDragStart} 
        />

        {/* Center (Player) */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
             <div className="h-12 border-b border-zinc-800 flex items-center justify-center gap-4 bg-zinc-900/50">
                 <button className="text-zinc-400 hover:text-white" onClick={handleAddText}>
                     <div className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs border border-zinc-700">
                         <Icon name="Type" size={14} /> Add Text
                     </div>
                 </button>
             </div>
             <Player 
                project={project} 
                onTimeUpdate={handleTimeUpdate} 
                onTogglePlay={handleTogglePlay}
             />
        </div>

        {/* Right Sidebar (Properties) */}
        <PropertiesPanel 
            clip={selectedClip} 
            onUpdateClip={handleUpdateClip}
            onDeleteClip={handleDeleteClip}
        />
      </div>

      {/* Bottom Timeline */}
      <Timeline 
        project={project} 
        onSeek={handleTimeUpdate}
        onSelectClip={(id) => updateProject({ selectedClipId: id })}
      />
    </div>
  );
};

export default App;