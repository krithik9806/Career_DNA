import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Dna,
  Sparkles,
  ArrowRight,
  FileText,
  Github,
  Layers,
  Route,
  MessageSquareCode,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Compass
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto pt-16 pb-20 px-6 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-950/80 border border-indigo-800/60 rounded-full text-xs text-indigo-300 font-mono shadow-xl backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>SIH25094 — AI Career Twin Advisor</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Build Your Living <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Career Digital Twin
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Merge your Resume, GitHub repositories, and self-reported skills into a unified interactive skill graph. Get automated ATS completeness scoring, personalized roadmaps, and grounded AI mentoring.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl flex items-center space-x-3 transition-all shadow-xl shadow-indigo-600/30 text-base"
            >
              <Compass className="w-5 h-5" />
              <span>Go to Your Digital Twin Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-indigo-600/30 text-base"
              >
                <span>Build Your Digital Twin Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gray-900/80 hover:bg-gray-800 text-gray-200 border border-gray-800 font-semibold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-colors text-base"
              >
                <span>Sign In to Existing Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="glass-panel-hover p-6 rounded-3xl space-y-3">
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-2xl w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ATS Resume Parsing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload PDF/DOCX resumes to compute ATS completeness scores (0-100), flag content gaps, and extract technical skills.
            </p>
          </div>

          <div className="glass-panel-hover p-6 rounded-3xl space-y-3">
            <div className="p-3 bg-purple-950/80 border border-purple-800/60 text-purple-400 rounded-2xl w-fit">
              <Github className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GitHub Code Quality</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect public GitHub accounts to evaluate repository stars, fork activity, top languages, and Project Quality Scores.
            </p>
          </div>

          <div className="glass-panel-hover p-6 rounded-3xl space-y-3">
            <div className="p-3 bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 rounded-2xl w-fit">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Grounded RAG AI Mentor</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Converse with an AI advisor grounded strictly in your personal profile JSON and O*NET reference occupation data.
            </p>
          </div>
        </div>
      </section>

      {/* Module Overview Section */}
      <section className="relative z-10 max-w-6xl mx-auto py-16 px-6 border-t border-gray-800/80 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">How Career DNA Works</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            From raw data to actionable career placement readiness in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-3 text-center">
            <span className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-400 font-mono font-bold text-sm inline-flex items-center justify-center border border-indigo-800">
              1
            </span>
            <h4 className="font-bold text-white text-sm">Onboarding Profile</h4>
            <p className="text-xs text-gray-400">Set your degree, education details, and target career role.</p>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-3 text-center">
            <span className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold text-sm inline-flex items-center justify-center border border-emerald-800">
              2
            </span>
            <h4 className="font-bold text-white text-sm">Resume & GitHub</h4>
            <p className="text-xs text-gray-400">Upload your resume and connect GitHub to extract verified skills.</p>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-3 text-center">
            <span className="w-8 h-8 rounded-full bg-purple-950 text-purple-400 font-mono font-bold text-sm inline-flex items-center justify-center border border-purple-800">
              3
            </span>
            <h4 className="font-bold text-white text-sm">Interactive Skill Graph</h4>
            <p className="text-xs text-gray-400">Visualize merged skills color-coded by source and confidence.</p>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 space-y-3 text-center">
            <span className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-400 font-mono font-bold text-sm inline-flex items-center justify-center border border-indigo-800">
              4
            </span>
            <h4 className="font-bold text-white text-sm">AI Roadmap & Mentor</h4>
            <p className="text-xs text-gray-400">Follow a prioritized roadmap with course recommendations and chat with RAG mentor.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 border-t border-gray-800/80 py-12 px-6 text-center text-xs text-gray-500 space-y-4">
        <div className="flex items-center justify-center space-x-2 text-indigo-400">
          <Dna className="w-5 h-5" />
          <span className="font-bold text-white text-sm">Career DNA — AI Career Twin</span>
        </div>
        <p>SIH25094 — One-Stop Personalized Career & Education Advisor Prototype</p>
      </footer>
    </div>
  );
};
