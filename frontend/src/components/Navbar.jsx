import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Dna, LogOut, User, Compass, FileText, Github, Route, MessageSquareCode } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full glass-panel sticky top-0 z-50 border-b border-gray-800/80 px-6 py-3.5 flex items-center justify-between transition-all duration-300">
      <Link to="/" className="flex items-center space-x-3 text-indigo-400 hover:text-indigo-300 transition-transform transform hover:scale-105 group">
        <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/60 group-hover:border-indigo-500 transition-colors shadow-lg shadow-indigo-500/10">
          <Dna className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white">
          Career <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DNA</span>
        </span>
      </Link>

      {user ? (
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/dashboard')
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 shadow-md shadow-indigo-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/resume"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/resume')
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 shadow-md shadow-indigo-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Resume</span>
          </Link>

          <Link
            to="/github"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/github')
                ? 'bg-purple-950/70 text-purple-300 border border-purple-800/80 shadow-md shadow-purple-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>GitHub</span>
          </Link>

          <Link
            to="/roadmap"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/roadmap')
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 shadow-md shadow-emerald-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <Route className="w-4 h-4 text-emerald-400" />
            <span>Roadmap</span>
          </Link>

          <Link
            to="/mentor"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/mentor')
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 shadow-md shadow-indigo-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <MessageSquareCode className="w-4 h-4 text-indigo-400" />
            <span>AI Mentor</span>
          </Link>

          <Link
            to="/onboarding"
            className={`flex items-center space-x-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
              isActive('/onboarding')
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80 shadow-md shadow-indigo-500/10'
                : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
            }`}
          >
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile</span>
          </Link>

          <div className="flex items-center space-x-3 pl-3 border-l border-gray-800">
            <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-indigo-800/60 shadow-inner text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{localStorage.getItem('career_dna_user_name') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}</span>
              </span>
              <span className="text-gray-400 font-mono text-[11px] border-l border-gray-800 pl-2">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 bg-gray-900/90 hover:bg-red-950/50 text-gray-300 hover:text-red-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all border border-gray-800 hover:border-red-800/60"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25 transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
};
