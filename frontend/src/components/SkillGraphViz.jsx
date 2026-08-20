import React, { useState } from 'react';
import { Layers, Sparkles, FileText, Code2, ShieldCheck, Info } from 'lucide-react';

export const SkillGraphViz = ({ skills = [], targetRole = '' }) => {
  const [filter, setFilter] = useState('all');
  const [activeNode, setActiveNode] = useState(null);

  // Group skills by source
  const filteredSkills = skills.filter(s => {
    if (filter === 'all') return true;
    return s.source === filter;
  });

  const getSourceColor = (source) => {
    switch (source) {
      case 'resume':
        return { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-700/60', badge: 'bg-emerald-500' };
      case 'github':
        return { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-700/60', badge: 'bg-purple-500' };
      default:
        return { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-700/60', badge: 'bg-indigo-500' };
    }
  };

  // Deduplicate skill names for unique node rendering
  const uniqueSkillNames = Array.from(new Set(filteredSkills.map(s => s.skill_name)));

  return (
    <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Aggregated Digital Twin Skill Graph</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Merged skills from Resume, GitHub repos, and self-reported onboarding data
          </p>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({skills.length})
          </button>
          <button
            onClick={() => setFilter('resume')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === 'resume' ? 'bg-emerald-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Resume</span>
          </button>
          <button
            onClick={() => setFilter('github')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === 'github' ? 'bg-purple-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>GitHub</span>
          </button>
          <button
            onClick={() => setFilter('self_reported')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === 'self_reported' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Self-Reported</span>
          </button>
        </div>
      </div>

      {/* Interactive Node Graph Container */}
      <div className="relative bg-gray-950/60 rounded-2xl border border-gray-800/80 p-8 min-h-[320px] flex items-center justify-center overflow-hidden">
        {/* Ambient Graph Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none"></div>

        {uniqueSkillNames.length > 0 ? (
          <div className="w-full flex flex-wrap justify-center items-center gap-3 relative z-10">
            {uniqueSkillNames.map((skillName, idx) => {
              const skillEntries = filteredSkills.filter(s => s.skill_name === skillName);
              const mainSource = skillEntries[0]?.source || 'self_reported';
              const style = getSourceColor(mainSource);
              const sourcesCount = skillEntries.length;

              return (
                <div
                  key={skillName}
                  onMouseEnter={() => setActiveNode(skillName)}
                  onMouseLeave={() => setActiveNode(null)}
                  className={`px-4 py-2 rounded-2xl border ${style.bg} ${style.border} ${style.text} transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg flex items-center space-x-2 relative group`}
                >
                  <span className={`w-2 h-2 rounded-full ${style.badge} animate-pulse`}></span>
                  <span className="text-xs font-semibold">{skillName}</span>
                  {sourcesCount > 1 && (
                    <span className="bg-gray-900/90 text-gray-300 border border-gray-700 text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                      {sourcesCount}x
                    </span>
                  )}

                  {/* Tooltip on Hover */}
                  {activeNode === skillName && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 text-white p-3 rounded-xl shadow-2xl w-48 z-30 pointer-events-none text-xs space-y-1">
                      <p className="font-bold border-b border-gray-800 pb-1">{skillName}</p>
                      <p className="text-[11px] text-gray-400">
                        Sources: {skillEntries.map(e => e.source).join(', ')}
                      </p>
                      <p className="text-[10px] text-indigo-400 font-mono">
                        Avg Confidence: {((skillEntries.reduce((acc, curr) => acc + (parseFloat(curr.confidence_score) || 1), 0) / skillEntries.length) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm space-y-2">
            <Info className="w-8 h-8 text-gray-600 mx-auto" />
            <p>No skills found for this filter view.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Resume</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>GitHub Repos</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Self-Reported</span>
          </div>
        </div>

        <span className="font-mono text-gray-500">
          Target Goal: {targetRole || 'Not specified'}
        </span>
      </div>
    </div>
  );
};
