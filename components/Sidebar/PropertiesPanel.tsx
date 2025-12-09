import React from 'react';
import { ProjectState, Clip, ClipType } from '../../types';
import { Icon } from '../Icon';

interface PropertiesPanelProps {
  clip: Clip | undefined;
  onUpdateClip: (id: string, updates: Partial<Clip>) => void;
  onDeleteClip: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ clip, onUpdateClip, onDeleteClip }) => {
  if (!clip) {
    return (
      <div className="w-72 bg-zinc-900 border-l border-zinc-800 p-8 flex flex-col items-center justify-center text-zinc-600">
        <Icon name="MousePointer2" size={32} className="mb-2 opacity-50" />
        <p className="text-xs text-center">Select a clip to edit properties</p>
      </div>
    );
  }

  const handlePropChange = (key: keyof Clip['properties'], value: number) => {
    onUpdateClip(clip.id, {
      properties: {
        ...clip.properties,
        [key]: value
      }
    });
  };

  return (
    <div className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto">
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 font-semibold text-sm text-zinc-200">
        {clip.name}
      </div>

      <div className="p-4 space-y-6">
        {/* Transform Section */}
        <div className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Transform</h3>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-400">Scale</label>
                    <span className="text-xs text-zinc-500">{clip.properties.scale.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" min="0.1" max="3" step="0.1" 
                    value={clip.properties.scale}
                    onChange={(e) => handlePropChange('scale', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-400">Rotation</label>
                    <span className="text-xs text-zinc-500">{clip.properties.rotation}°</span>
                </div>
                <input 
                    type="range" min="-180" max="180" step="1" 
                    value={clip.properties.rotation}
                    onChange={(e) => handlePropChange('rotation', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-400">Opacity</label>
                    <span className="text-xs text-zinc-500">{(clip.properties.opacity * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={clip.properties.opacity}
                    onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
            </div>
        </div>

        {/* Text Specifics */}
        {clip.type === ClipType.TEXT && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Text Content</h3>
                <textarea 
                    value={clip.content}
                    onChange={(e) => onUpdateClip(clip.id, { content: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                    rows={3}
                />
            </div>
        )}

        {/* Actions */}
        <div className="pt-6 mt-6 border-t border-zinc-800">
            <button 
                onClick={() => onDeleteClip(clip.id)}
                className="w-full py-2 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors text-xs font-medium"
            >
                <Icon name="Trash2" size={14} />
                Delete Clip
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
