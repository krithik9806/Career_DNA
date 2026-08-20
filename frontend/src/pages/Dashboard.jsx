import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { SkillGraphViz } from '../components/SkillGraphViz.jsx';
import {
  Compass,
  GraduationCap,
  Target,
  Sparkles,
  UserCheck,
  Edit3,
  Dna,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  FileText,
  Github,
  Award,
  ArrowRight,
  Route,
  MessageSquareCode,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, resumeRes, githubRes, roadmapRes, skillGraphRes] = await Promise.all([
        api.get('/profile'),
        api.get('/resume/latest').catch(() => ({ data: null })),
        api.get('/github/latest').catch(() => ({ data: null })),
        api.get('/roadmap').catch(() => ({ data: null })),
        api.get(`/skillgraph/${user?.id}`).catch(() => ({ data: null }))
      ]);

      setProfile(profileRes.data?.student || null);
      setSkills(skillGraphRes.data?.skills || profileRes.data?.self_reported_skills?.map(s => ({ skill_name: s, source: 'self_reported' })) || []);
      setLatestResume(resumeRes.data?.resume || null);
      setGithubProfile(githubRes.data?.github_profile || null);
      setRoadmapData(roadmapRes.data || null);
    } catch (err) {
      console.error('Fetch dashboard composite data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Initializing Student Digital Twin Dashboard...</p>
        </div>
      </div>
    );
  }

  const isProfileComplete = profile?.target_role && profile?.education;
  const resumeScore = latestResume?.completeness_score ? parseFloat(latestResume.completeness_score) : 0;
  const githubScore = githubProfile?.project_quality_score ? parseFloat(githubProfile.project_quality_score) : 0;
  const roadmapPct = roadmapData?.completion_percentage ? parseFloat(roadmapData.completion_percentage) : 0;

  // Placement Readiness Score (P1 Composite Metric)
  // Weighted Composite: 35% Resume Score + 35% GitHub Quality + 30% Skill-Gap Roadmap Closure %
  const placementReadinessScore = Math.round(
    (resumeScore * 0.35) + (githubScore * 0.35) + (roadmapPct * 0.30)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Dna className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Digital Twin Dashboard</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Logged in as <span className="text-indigo-300 font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <Link
              to="/mentor"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>AI Mentor Chat</span>
            </Link>

            <Link
              to="/roadmap"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm"
            >
              <Route className="w-4 h-4" />
              <span>Learning Roadmap</span>
            </Link>

            <Link
              to="/onboarding"
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-indigo-300 border border-indigo-900/60 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {!isProfileComplete && (
          <div className="mt-6 p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3 text-amber-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Your student profile is incomplete. Set your target role and education to customize AI advice.</span>
            </div>
            <Link to="/onboarding" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              Complete Profile
            </Link>
          </div>
        )}
      </div>

      {/* Main Placement Readiness Composite Score Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-800" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * placementReadinessScore) / 100}
                className={placementReadinessScore >= 75 ? 'text-emerald-400' : placementReadinessScore >= 50 ? 'text-indigo-400' : 'text-amber-400'}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-extrabold text-2xl text-white font-mono">{placementReadinessScore}%</span>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Placement Readiness Composite Score</h3>
            </div>
            <p className="text-xs text-gray-400">
              Weighted composite of Resume ATS Score (35%), GitHub Project Quality (35%), & Roadmap Skill Gap Closure (30%).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 text-center">
            <span className="text-gray-400 block mb-0.5">Resume Score</span>
            <span className="font-bold text-emerald-400 text-sm">{Math.round(resumeScore)}%</span>
          </div>
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 text-center">
            <span className="text-gray-400 block mb-0.5">GitHub Score</span>
            <span className="font-bold text-purple-400 text-sm">{Math.round(githubScore)}%</span>
          </div>
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 text-center">
            <span className="text-gray-400 block mb-0.5">Roadmap Closure</span>
            <span className="font-bold text-indigo-400 text-sm">{Math.round(roadmapPct)}%</span>
          </div>
        </div>
      </div>

      {/* Module Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Profile Details Card */}
        <div className="glass-panel-hover p-6 rounded-2xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-950/80 rounded-xl border border-indigo-800/60 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Name</h3>
              <p className="text-base font-bold text-white truncate">
                {profile?.name || localStorage.getItem('career_dna_user_name') || 'Student'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center space-x-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{profile?.education || 'Degree Not Set'}</span>
          </div>
        </div>

        {/* Target Career Role Card */}
        <div className="glass-panel-hover p-6 rounded-2xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-950/80 rounded-xl border border-purple-800/60 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Domain(s)</h3>
              <p className="text-base font-bold text-white truncate">{profile?.target_role || 'Not Set'}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>Target Role active</span>
          </div>
        </div>

        {/* Resume Status Card */}
        <Link to="/resume" className="glass-panel-hover p-6 rounded-2xl space-y-3 block group">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-800/60 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resume ATS</h3>
              <p className="text-base font-bold text-white font-mono group-hover:text-emerald-300 transition-colors">
                {latestResume ? `${Math.round(resumeScore)}%` : 'Upload Now'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center justify-between">
            <span>{latestResume ? 'Parsed ATS Score' : 'Click to Upload'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* GitHub Status Card */}
        <Link to="/github" className="glass-panel-hover p-6 rounded-2xl space-y-3 block group">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-950/80 rounded-xl border border-purple-800/60 text-purple-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Quality</h3>
              <p className="text-base font-bold text-white font-mono group-hover:text-purple-300 transition-colors">
                {githubProfile ? `${Math.round(githubScore)}%` : 'Connect Now'}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center justify-between">
            <span>{githubProfile ? `@${githubProfile.username}` : 'Click to Connect'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Interactive Aggregated Skill Graph Section */}
      <SkillGraphViz skills={skills} targetRole={profile?.target_role} />

      {/* Roadmap & AI Mentor Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roadmap Progress Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Route className="w-5 h-5 text-emerald-400" />
              <span>Career Roadmap Status</span>
            </h3>
            <Link to="/roadmap" className="text-xs text-emerald-400 hover:underline">View Roadmap →</Link>
          </div>

          {roadmapData?.roadmap_items?.length > 0 ? (
            <div className="space-y-3">
              {roadmapData.roadmap_items.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 font-mono flex items-center justify-center font-bold text-[11px]">
                      #{item.priority_rank}
                    </span>
                    <span className="font-semibold text-white">{item.skill_name}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    item.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-gray-500">No learning roadmap generated yet.</p>
              <Link to="/roadmap" className="inline-block text-xs text-indigo-400 underline font-medium">
                Generate AI Roadmap
              </Link>
            </div>
          )}
        </div>

        {/* AI Mentor Quick Launch Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-gray-800 pb-3 mb-3">
              <MessageSquareCode className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Grounded AI Mentor</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Converse with an AI advisor grounded in your resume text, GitHub repos, and target role benchmark requirements.
            </p>
          </div>

          <Link
            to="/mentor"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Mentor Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
