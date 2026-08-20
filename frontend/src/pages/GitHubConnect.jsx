import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  Code2,
  Github,
  Star,
  GitFork,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Award,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const GitHubConnect = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [githubProfile, setGithubProfile] = useState(null);

  useEffect(() => {
    fetchLatestGitHub();
  }, []);

  const fetchLatestGitHub = async () => {
    try {
      setFetching(true);
      const res = await api.get('/github/latest');
      if (res.data?.github_profile) {
        setGithubProfile(res.data.github_profile);
        setUsername(res.data.github_profile.username || '');
      }
    } catch (err) {
      console.warn('Failed to load existing github profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a GitHub username.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/github/connect', { username: username.trim() });
      if (res.data?.github_profile) {
        setGithubProfile(res.data.github_profile);
      }
    } catch (err) {
      console.error('GitHub connection error:', err);
      setError(err.response?.data?.error || 'Failed to analyze GitHub profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading GitHub profile stats...</p>
        </div>
      </div>
    );
  }

  const stats = githubProfile?.repo_stats_json;
  const qualityScore = githubProfile?.project_quality_score || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-3 mb-2">
          <Github className="w-7 h-7 text-purple-400" />
          <h1 className="text-3xl font-extrabold text-white">GitHub Project Analyzer</h1>
        </div>
        <p className="text-gray-400 text-sm max-w-2xl">
          Connect your public GitHub username to pull real repository stats, stars, commit activity, language distributions, and evaluate your Project Quality Score.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Input & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <span>Connect Profile</span>
            </h3>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  GitHub Username
                </label>
                <div className="relative">
                  <Github className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. octocat"
                    className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing GitHub...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Fetch Stats & Merge Skills</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Connected User Profile Card */}
          {stats && (
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-3">
              {stats.avatar_url && (
                <img
                  src={stats.avatar_url}
                  alt={stats.username}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-purple-500"
                />
              )}
              <h4 className="font-bold text-white text-lg">@{stats.username}</h4>
              <p className="text-xs text-gray-400">
                {stats.public_repos} Repositories • {stats.followers} Followers
              </p>
              <a
                href={`https://github.com/${stats.username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-purple-400 hover:underline"
              >
                <span>View GitHub Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: GitHub Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          {githubProfile ? (
            <>
              {/* Project Quality Score Card */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  {/* Score Badge */}
                  <div className="w-20 h-20 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center font-extrabold text-2xl text-purple-300 font-mono shadow-lg shadow-purple-950/50">
                    {Math.round(qualityScore)}%
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Project Quality Score</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      Calculated from repository variety, stargazers, commit freshness, and original source code.
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="bg-gray-900 hover:bg-gray-800 text-purple-300 border border-purple-900/60 font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <span>View in Skill Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Repo Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                  <span className="text-xs text-gray-400 block mb-1">Public Repos</span>
                  <span className="text-xl font-bold text-white font-mono">{stats?.public_repos || 0}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                  <span className="text-xs text-gray-400 block mb-1">Total Stars</span>
                  <span className="text-xl font-bold text-yellow-400 font-mono flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{stats?.total_stars || 0}</span>
                  </span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                  <span className="text-xs text-gray-400 block mb-1">Forks</span>
                  <span className="text-xl font-bold text-purple-300 font-mono flex items-center justify-center space-x-1">
                    <GitFork className="w-4 h-4 text-purple-400" />
                    <span>{stats?.total_forks || 0}</span>
                  </span>
                </div>
              </div>

              {/* Extracted Top Languages & Skills */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <span>GitHub Extracted Skills & Languages</span>
                </h3>

                {stats?.top_languages?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.top_languages.map((item) => (
                      <span
                        key={item.language}
                        className="bg-purple-950/90 text-purple-300 border border-purple-800/60 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.language} ({item.repo_count} repos)</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No language stats available.</p>
                )}
              </div>

              {/* Top Repositories List */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
                  <Github className="w-5 h-5 text-purple-400" />
                  <span>Top Public Repositories</span>
                </h3>

                {stats?.top_repos?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.top_repos.map((repo) => (
                      <div
                        key={repo.name}
                        className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex items-center justify-between"
                      >
                        <div>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-white hover:text-purple-300 transition-colors text-sm flex items-center space-x-1.5"
                          >
                            <span>{repo.name}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </a>
                          <span className="text-xs text-gray-400">{repo.language || 'Code'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-yellow-400 font-mono bg-yellow-950/40 px-2.5 py-1 rounded-lg border border-yellow-800/40">
                          <Star className="w-3.5 h-3.5 fill-yellow-400" />
                          <span>{repo.stars}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No public repos found.</p>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
              <Github className="w-16 h-16 text-gray-600 mx-auto" />
              <h3 className="text-xl font-bold text-white">No GitHub Profile Connected Yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Enter your GitHub username on the left to extract repository stats and calculate your Project Quality Score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
