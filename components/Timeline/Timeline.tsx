import React, { useRef, MouseEvent } from 'react';
import { ProjectState, Clip, Track } from '../../types';
import { TIMELINE_ZOOM_DEFAULT } from '../../constants';
import clsx from 'clsx';
import { Icon } from '../Icon';

interface TimelineProps {
  project: ProjectState;
  onSeek: (time: number) => void;
  onSelectClip: (id: string | null) => void;
}

const Timeline: React.FC<TimelineProps> = ({ project, onSeek, onSelectClip }) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Ruler generation
  const majorTicks = [];
  const totalSeconds = Math.max(project.duration + 10, 60); // Min 60s
  for (let i = 0; i < totalSeconds; i += 5) {
    majorTicks.push(i);
  }

  const handleTimelineClick = (e: MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, x / project.zoom);
    onSeek(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-t border-zinc-800 select-none overflow-hidden h-[300px]">
      {/* Toolbar */}
      <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-4 bg-zinc-900">
        <span className="text-xs text-zinc-400">Timeline</span>
        <div className="flex-1" />
        <button className="text-zinc-400 hover:text-white"><Icon name="ZoomIn" size={16} /></button>
        <button className="text-zinc-400 hover:text-white"><Icon name="ZoomOut" size={16} /></button>
        <button className="text-zinc-400 hover:text-white"><Icon name="Settings2" size={16} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Track Headers */}
        <div className="w-48 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 z-10 flex flex-col pt-8">
           {project.tracks.map(track => (
               <div key={track.id} className="h-24 border-b border-zinc-800 flex items-center px-3 gap-2 group hover:bg-zinc-800 transition-colors">
                   <Icon name={track.type === 'video' ? 'Video' : track.type === 'audio' ? 'Music' : 'Type'} size={16} className="text-zinc-500" />
                   <span className="text-xs font-medium text-zinc-300 truncate flex-1">{track.name}</span>
                   <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white"><Icon name="Eye" size={14} /></button>
                   <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white"><Icon name="Volume2" size={14} /></button>
               </div>
           ))}
        </div>

        {/* Scrollable Timeline Area */}
        <div 
            className="flex-1 overflow-auto relative bg-zinc-950" 
            ref={timelineRef}
            onClick={handleTimelineClick}
        >
            <div style={{ width: `${totalSeconds * project.zoom}px`, minWidth: '100%' }}>
                {/* Ruler */}
                <div className="h-8 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10 w-full">
                    {majorTicks.map(tick => (
                        <div 
                            key={tick} 
                            className="absolute top-0 bottom-0 border-l border-zinc-700 text-[10px] text-zinc-500 pl-1 pt-1"
                            style={{ left: `${tick * project.zoom}px` }}
                        >
                            {formatTime(tick)}
                        </div>
                    ))}
                </div>

                {/* Tracks Content */}
                <div className="relative">
                    {project.tracks.map(track => {
                        const trackClips = project.clips.filter(c => c.trackId === track.id);
                        return (
                            <div key={track.id} className="h-24 border-b border-zinc-800 relative bg-zinc-900/20">
                                {trackClips.map(clip => (
                                    <div
                                        key={clip.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectClip(clip.id);
                                        }}
                                        className={clsx(
                                            "absolute top-2 bottom-2 rounded-md border overflow-hidden cursor-pointer transition-all",
                                            project.selectedClipId === clip.id 
                                                ? "border-teal-500 ring-1 ring-teal-500/50 z-10 shadow-lg" 
                                                : "border-zinc-700 hover:border-zinc-500 opacity-90",
                                            clip.type === 'VIDEO' ? "bg-blue-900/40" : 
                                            clip.type === 'IMAGE' ? "bg-purple-900/40" :
                                            clip.type === 'TEXT' ? "bg-orange-900/40" : "bg-green-900/40"
                                        )}
                                        style={{
                                            left: `${clip.startTime * project.zoom}px`,
                                            width: `${clip.duration * project.zoom}px`
                                        }}
                                    >
                                        <div className="px-2 py-1 text-[10px] font-bold text-white truncate drop-shadow-md">
                                            {clip.name}
                                        </div>
                                        {/* Simplified Thumbnails strip would go here */}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Playhead */}
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-white z-20 pointer-events-none"
                        style={{ 
                            left: `${project.currentTime * project.zoom}px`,
                            height: `${project.tracks.length * 96}px`
                        }}
                    >
                        <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-teal-500" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
