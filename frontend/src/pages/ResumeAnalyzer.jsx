import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [latestResume, setLatestResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      setFetching(true);
      const res = await api.get('/resume/latest');
      if (res.data?.resume) {
        setLatestResume(res.data.resume);
      }
    } catch (err) {
      console.warn('Failed to load existing resume:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.pdf') || selected.name.endsWith('.docx')) {
        setFile(selected);
        setError('');
      } else {
        setError('Please select a valid PDF or DOCX resume file.');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid PDF or DOCX file.');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file first.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.resume) {
        setLatestResume(res.data.resume);
        setFile(null);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading resume analysis...</p>
        </div>
      </div>
    );
  }

  const parsed = latestResume?.parsed_json;
  const score = latestResume?.completeness_score || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-3 mb-2">
          <FileText className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-extrabold text-white">AI Resume Analyzer</h1>
        </div>
        <p className="text-gray-400 text-sm max-w-2xl">
          Upload your PDF/DOCX resume. Our ATS parsing engine extracts your technical skills, experience, and education, scores your profile completeness, and flags actionable gaps.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Upload Resume</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-950/40'
                    : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                }`}
              >
                <input
                  type="file"
                  id="resume-upload-input"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-upload-input" className="cursor-pointer block">
                  <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-white block">
                    {file ? file.name : 'Click or drag PDF/DOCX resume'}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">Maximum file size: 10MB</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none cursor-pointer"
              >
                {uploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Extract Skills</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Stats Card */}
          {latestResume && (
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-3">
                <span>Last Uploaded:</span>
                <span className="font-mono text-gray-300">
                  {new Date(latestResume.uploaded_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Extracted Resume Skills:</span>
                <span className="font-bold text-indigo-400 font-mono text-sm">
                  {parsed?.skills?.length || 0} Skills
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Parsed Results Screen */}
        <div className="lg:col-span-2 space-y-6">
          {latestResume ? (
            <>
              {/* Completeness Score Card */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  {/* Score Circular Badge */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-800"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * score) / 100}
                        className={
                          score >= 80
                            ? 'text-emerald-500'
                            : score >= 60
                            ? 'text-indigo-500'
                            : 'text-amber-500'
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xl text-white font-mono">
                      {Math.round(score)}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-bold text-white">ATS Resume Completeness</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      Evaluated for skill density, project details, and ATS formatting standards.
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        score >= 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : score >= 60
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {score >= 80 ? 'Strong ATS Quality' : score >= 60 ? 'Moderate Completeness' : 'Needs Optimization'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="bg-gray-900 hover:bg-gray-800 text-indigo-300 border border-indigo-900/60 font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <span>View in Skill Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Extracted Skills Section */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Extracted Skills ({parsed?.skills?.length || 0})</span>
                </h3>

                {parsed?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parsed.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center space-x-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No skills extracted from this resume.</p>
                )}
              </div>

              {/* Flagged ATS Gaps Panel */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Flagged Resume Gaps & Recommendations</span>
                </h3>

                {parsed?.flagged_gaps?.length > 0 ? (
                  <ul className="space-y-3">
                    {parsed.flagged_gaps.map((gap, idx) => (
                      <li
                        key={idx}
                        className="bg-amber-950/30 border border-amber-900/40 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-amber-200"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No critical gaps detected! Your resume structure is well optimized.</span>
                  </div>
                )}
              </div>

              {/* Parsed Experience & Education Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div className="glass-panel p-5 rounded-2xl border border-gray-800">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>Experience Highlights</span>
                  </h4>
                  {parsed?.experience?.length > 0 ? (
                    <div className="space-y-3 text-xs text-gray-300">
                      {parsed.experience.map((exp, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                          <p className="font-semibold text-white">{exp.title}</p>
                          <p className="text-gray-400">{exp.company} • {exp.duration}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No structured experience parsed.</p>
                  )}
                </div>

                {/* Education */}
                <div className="glass-panel p-5 rounded-2xl border border-gray-800">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Parsed Education</span>
                  </h4>
                  {parsed?.education?.length > 0 ? (
                    <div className="space-y-3 text-xs text-gray-300">
                      {parsed.education.map((edu, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                          <p className="font-semibold text-white">{edu.degree}</p>
                          <p className="text-gray-400">{edu.institution} ({edu.year})</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No structured education parsed.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
              <FileText className="w-16 h-16 text-gray-600 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Resume Analyzed Yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Upload your resume in PDF or DOCX format on the left to extract your skills and calculate your completeness score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
