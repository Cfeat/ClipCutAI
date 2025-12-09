import React, { useRef, useEffect } from 'react';
import { ProjectState, Clip, ClipType } from '../types';

interface PlayerProps {
  project: ProjectState;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
}

const Player: React.FC<PlayerProps> = ({ project, onTimeUpdate, onTogglePlay }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We'll use a simple approach: Render the "active" clips stacked.
  // The topmost visible video clip determines the main background, 
  // text clips are overlays.
  
  // Find active clips at current time
  const activeClips = project.clips.filter(clip => 
    project.currentTime >= clip.startTime && 
    project.currentTime < clip.startTime + clip.duration
  );

  // Sort by track order (simplified: assumes track order in state matches render order)
  // In a real app, we'd map track IDs to Z-index.
  const activeVideo = activeClips.find(c => c.type === ClipType.VIDEO || c.type === ClipType.IMAGE);
  const activeTextClips = activeClips.filter(c => c.type === ClipType.TEXT);

  // Auto-pause at end
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (!project.isPlaying) return;

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const newTime = project.currentTime + delta;
      
      if (newTime >= project.duration) {
        onTimeUpdate(project.duration);
        onTogglePlay(); // Pause
      } else {
        onTimeUpdate(newTime);
        animationFrame = requestAnimationFrame(loop);
      }
    };

    if (project.isPlaying) {
      animationFrame = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [project.isPlaying, project.currentTime, project.duration, onTimeUpdate, onTogglePlay]);


  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-video bg-zinc-900 shadow-2xl overflow-hidden"
      >
        {/* Placeholder if empty */}
        {!activeVideo && activeClips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
            <span className="text-sm">No Signal</span>
          </div>
        )}

        {/* Render Active Video/Image */}
        {activeVideo && activeVideo.type === ClipType.VIDEO && (
           <video
             key={activeVideo.id} // Re-mount if clip changes
             src={activeVideo.src}
             className="absolute inset-0 w-full h-full object-contain bg-black"
             style={{
                opacity: activeVideo.properties.opacity,
                transform: `scale(${activeVideo.properties.scale}) rotate(${activeVideo.properties.rotation}deg)`
             }}
             // Syncing video element time is tricky in React without refs.
             // We set currentTime manually when it mounts or seeks.
             // For smooth playback, we trust the 'isPlaying' prop creates a loop,
             // but HTML5 video needs 'play()' called.
             ref={(el) => {
                 if (el) {
                     const seekTime = project.currentTime - activeVideo.startTime + activeVideo.offset;
                     if (Math.abs(el.currentTime - seekTime) > 0.5) {
                         el.currentTime = seekTime; 
                     }
                     if (project.isPlaying && el.paused) el.play().catch(() => {});
                     if (!project.isPlaying && !el.paused) el.pause();
                 }
             }}
             muted
           />
        )}

        {activeVideo && activeVideo.type === ClipType.IMAGE && (
            <img
                src={activeVideo.src}
                alt="active clip"
                className="absolute inset-0 w-full h-full object-contain bg-black"
                style={{
                    opacity: activeVideo.properties.opacity,
                    transform: `scale(${activeVideo.properties.scale}) rotate(${activeVideo.properties.rotation}deg)`
                 }}
            />
        )}

        {/* Render Text Overlays */}
        {activeTextClips.map(clip => (
            <div
                key={clip.id}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <h2 
                    className="text-white font-bold drop-shadow-lg text-center whitespace-pre-wrap"
                    style={{
                        fontSize: `${4 * clip.properties.scale}rem`,
                        opacity: clip.properties.opacity,
                        transform: `rotate(${clip.properties.rotation}deg) translate(${clip.properties.x}px, ${clip.properties.y}px)`
                    }}
                >
                    {clip.content}
                </h2>
            </div>
        ))}
      </div>

      {/* Playback Controls Overlay (Visible on Hover) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-800/80 backdrop-blur px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={() => onTimeUpdate(0)} className="text-zinc-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
         </button>
         <button onClick={onTogglePlay} className="text-white bg-teal-600 hover:bg-teal-500 rounded-full p-2">
            {project.isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
         </button>
         <span className="text-xs font-mono text-zinc-300 w-16 text-center">
            {new Date(project.currentTime * 1000).toISOString().substr(14, 5)}
         </span>
      </div>
    </div>
  );
};

export default Player;
