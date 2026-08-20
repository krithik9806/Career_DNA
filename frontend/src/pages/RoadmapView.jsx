import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  PlayCircle,
  BookOpen,
  ExternalLink,
  Target,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const RoadmapView = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [showReasoningMap, setShowReasoningMap] = useState({});

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      setRoadmapData(res.data);
    } catch (err) {
      console.warn('Failed to load existing roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await api.post('/roadmap/generate', {});
      const data = res.data?.roadmap_data || res.data;
      if (data) {
        setRoadmapData(data);
      }
      await fetchRoadmap();
    } catch (err) {
      console.error('Generate roadmap error:', err);
      setError(err.response?.data?.error || 'Failed to generate personalized career roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await api.patch(`/roadmap/${itemId}/status`, { status: newStatus });
      // Update state locally
      setRoadmapData(prev => {
        if (!prev) return prev;
        const updatedItems = prev.roadmap_items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        );
        const total = updatedItems.length;
        const done = updatedItems.filter(i => i.status === 'completed').length;
        return {
          ...prev,
          roadmap_items: updatedItems,
          completion_percentage: total > 0 ? Math.round((done / total) * 100) : 0
        };
      });
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const toggleReasoning = (itemId) => {
    setShowReasoningMap(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Building personalized career roadmap...</p>
        </div>
      </div>
    );
  }

  const items = roadmapData?.roadmap_items || [];
  const targetRole = roadmapData?.target_role || 'Full-Stack Web Developer';
  const studentName = roadmapData?.student_name || localStorage.getItem('career_dna_user_name') || 'Student';
  const targetCompanies = roadmapData?.target_companies || 'Product-based Companies';
  const targetCtc = roadmapData?.target_ctc || '6-12 LPA';
  const progressPct = roadmapData?.completion_percentage || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Compass className="w-7 h-7 text-indigo-400" />
              <h1 className="text-3xl font-extrabold text-white">Personalized Career Roadmap</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Custom-synthesized for <span className="text-white font-bold">{studentName}</span> • Target: <span className="text-indigo-300 font-semibold">{targetRole}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium bg-indigo-950/80 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800/60">
                🏢 {targetCompanies}
              </span>
              <span className="text-[11px] font-medium bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/60">
                💰 Target: {targetCtc}
              </span>
              <span className="text-[11px] font-medium bg-purple-950/80 text-purple-300 px-3 py-1 rounded-full border border-purple-800/60">
                🎯 Tailored to Profile Setup
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 text-sm self-start md:self-auto disabled:opacity-50"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Synthesizing Profile Roadmap...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Re-Generate AI Roadmap</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white font-mono">{progressPct}%</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Roadmap Skill Closure Progress</p>
              <p className="text-[11px] text-gray-500">{items.filter(i => i.status === 'completed').length} of {items.length} steps completed</p>
            </div>
          </div>

          <div className="w-full md:w-64 bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Roadmap Milestone Timeline */}
      {items.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-gray-800/80 before:z-0">
          {items.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';
            const showReasoning = showReasoningMap[item.id];

            return (
              <div key={item.id || idx} className="relative z-10 flex items-start space-x-6 group">
                {/* Milestone Rank Circle Badge */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-lg font-mono flex-shrink-0 shadow-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/90 text-emerald-400 border-emerald-700/80 shadow-emerald-950/40'
                      : isInProgress
                      ? 'bg-indigo-950/90 text-indigo-400 border-indigo-700/80 shadow-indigo-950/40 animate-pulse'
                      : 'bg-gray-900 text-gray-400 border-gray-800'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : `#${item.priority_rank}`}
                </div>

                {/* Milestone Content Card */}
                <div className="flex-1 glass-panel-hover p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white tracking-tight">{item.skill_name}</h3>
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : isInProgress
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.estimated_hours && (
                          <span className="text-[11px] font-mono bg-gray-900 text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-800 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>{item.estimated_hours}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Priority Step {item.priority_rank} for {targetRole}</p>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {!isCompleted && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, isInProgress ? 'pending' : 'in_progress')}
                          className={`text-xs font-medium px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
                            isInProgress
                              ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700'
                              : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-800'
                          }`}
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{isInProgress ? 'In Progress' : 'Start Step'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(item.id, isCompleted ? 'pending' : 'completed')}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                            : 'bg-gray-900 hover:bg-emerald-950/60 text-gray-300 hover:text-emerald-300 border-gray-800 hover:border-emerald-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Reasoning & Why This Recommendation */}
                  <div className="space-y-2">
                    <div className="bg-indigo-950/30 border border-indigo-900/40 p-3.5 rounded-2xl text-xs text-indigo-200 leading-relaxed">
                      <span className="font-semibold text-indigo-300 block mb-1">AI Mentor Profile Alignment:</span>
                      {item.reasoning_text}
                    </div>
                  </div>

                  {/* Actionable Project Task */}
                  {item.recommended_action && (
                    <div className="bg-purple-950/30 border border-purple-900/40 p-3.5 rounded-2xl text-xs text-purple-200 leading-relaxed flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-purple-300 block mb-0.5">Recommended Action / Project Task:</span>
                        <span>{item.recommended_action}</span>
                      </div>
                    </div>
                  )}

                  {/* Recommended Reference Courses */}
                  {Array.isArray(item.recommended_courses) && item.recommended_courses.length > 0 && (
                    <div className="pt-2 border-t border-gray-800/80">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span>Recommended Curated Courses & Practice Guides:</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.recommended_courses.map((course, cIdx) => (
                          <a
                            key={cIdx}
                            href={course.course_url || course.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-900/70 hover:bg-gray-900 p-3 rounded-xl border border-gray-800 hover:border-purple-800/60 transition-all flex items-center justify-between text-xs group/course"
                          >
                            <div>
                              <p className="font-semibold text-white group-hover/course:text-purple-300 transition-colors line-clamp-1">
                                {course.course_title || course.title}
                              </p>
                              <p className="text-[11px] text-gray-400">{course.provider}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover/course:text-purple-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
          <Compass className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Click "Re-Generate AI Roadmap" above to compare your skill graph against target role standards.
          </p>
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Roadmap Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
