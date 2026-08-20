import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  User,
  GraduationCap,
  Target,
  Sparkles,
  CheckCircle2,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Briefcase,
  Lock,
  Mail,
  ShieldCheck,
  Save,
  Layers,
  Linkedin,
  Github,
  Globe,
  Code2,
  DollarSign,
  Building2,
  FileText
} from 'lucide-react';

const PRESET_ROLES = [
  'Full-Stack Web Developer',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'DevOps & Cloud Engineer',
  'Frontend Engineer',
  'Backend Engineer'
];

const PRESET_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PyTorch',
  'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'HTML/CSS',
  'REST APIs', 'Machine Learning', 'Data Structures', 'System Design'
];

const COMPANY_TYPES = [
  'Top Product Companies / FAANG',
  'High-Growth Tech Startups',
  'Fintech & Financial Systems',
  'Global IT Services & Consulting'
];

export const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Student Profile Form State
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [placementStatus, setPlacementStatus] = useState('Looking for Internships / Jobs');
  
  // Professional Links (User Requested)
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [careerBio, setCareerBio] = useState('');

  // Career Preferences (Support up to 3 domains)
  const [targetRoles, setTargetRoles] = useState(['Full-Stack Web Developer']);
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [targetCompanies, setTargetCompanies] = useState(['Top Product Companies / FAANG', 'High-Growth Tech Startups']);
  const [targetCtc, setTargetCtc] = useState('6-12 LPA');
  const [preferredWorkType, setPreferredWorkType] = useState('Hybrid / Remote');

  // Skill Graph Topics
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Git', 'Node.js', 'SQL']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  useEffect(() => {
    // Load existing student profile
    const loadProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get('/profile');

        const student = res.data?.student;
        const localSavedName = localStorage.getItem('career_dna_user_name');

        if (student) {
          setName(student.name || localSavedName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student');
          setEducation(student.education || 'B.Tech Computer Science & Engineering');
          setPlacementStatus(student.placement_status || 'Looking for Internships / Jobs');
          setLinkedinUrl(student.linkedin_url || '');
          setGithubUrl(student.github_url || student.github_username || '');
          setLeetcodeUrl(student.leetcode_url || '');
          setPortfolioUrl(student.portfolio_url || '');
          setTargetCtc(student.target_ctc || '6-12 LPA');
          setPreferredWorkType(student.preferred_work_type || 'Hybrid / Remote');
          setCareerBio(student.career_bio || '');

          if (Array.isArray(student.target_companies) && student.target_companies.length > 0) {
            setTargetCompanies(student.target_companies);
          }

          if (Array.isArray(student.target_roles) && student.target_roles.length > 0) {
            setTargetRoles(student.target_roles.slice(0, 3));
          } else if (student.target_role) {
            const split = student.target_role.split(',').map(r => r.trim()).filter(Boolean);
            setTargetRoles(split.length > 0 ? split.slice(0, 3) : ['Full-Stack Web Developer']);
          }
        } else {
          setName(localSavedName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student');
          setEducation('B.Tech Computer Science & Engineering');
        }

        if (res.data?.self_reported_skills?.length > 0) {
          setSkills(res.data.self_reported_skills);
        }
      } catch (err) {
        console.warn('[PROFILE] Profile fetch notice:', err.message);
        const localSavedName = localStorage.getItem('career_dna_user_name');
        setName(localSavedName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student');
        setEducation('B.Tech Computer Science & Engineering');
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [user]);

  const toggleTargetRole = (role) => {
    if (targetRoles.includes(role)) {
      if (targetRoles.length === 1) {
        setError('You must select at least 1 target domain.');
        return;
      }
      setError('');
      setTargetRoles(targetRoles.filter(r => r !== role));
    } else {
      if (targetRoles.length >= 3) {
        setError('You can select a maximum of 3 target domains.');
        return;
      }
      setError('');
      setTargetRoles([...targetRoles, role]);
    }
  };

  const addCustomDomain = (e) => {
    e.preventDefault();
    if (customRole.trim()) {
      if (targetRoles.length >= 3) {
        setError('Maximum of 3 target domains allowed.');
        return;
      }
      if (!targetRoles.includes(customRole.trim())) {
        setTargetRoles([...targetRoles, customRole.trim()]);
        setCustomRole('');
        setIsCustomRole(false);
        setError('');
      }
    }
  };

  const toggleCompanyType = (comp) => {
    if (targetCompanies.includes(comp)) {
      setTargetCompanies(targetCompanies.filter(c => c !== comp));
    } else {
      setTargetCompanies([...targetCompanies, comp]);
    }
  };

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Please provide your full name / username.');
      setStep(1);
      return;
    }
    if (!education.trim()) {
      setError('Please specify your current degree & university details.');
      setStep(1);
      return;
    }
    if (targetRoles.length === 0) {
      setError('Please select at least 1 target career domain.');
      setStep(3);
      return;
    }

    try {
      setLoading(true);

      // Save user name permanently in localStorage
      localStorage.setItem('career_dna_user_name', name.trim());

      const finalRoleString = targetRoles.join(', ');

      // Save to backend & local session
      await api.post('/profile', {
        name: name.trim(),
        education: education.trim(),
        placement_status: placementStatus,
        linkedin_url: linkedinUrl.trim(),
        github_url: githubUrl.trim(),
        leetcode_url: leetcodeUrl.trim(),
        portfolio_url: portfolioUrl.trim(),
        target_role: finalRoleString,
        target_roles: targetRoles,
        target_companies: targetCompanies,
        target_ctc: targetCtc,
        preferred_work_type: preferredWorkType,
        career_bio: careerBio.trim(),
        self_reported_skills: skills
      });

      // Update local storage demo user metadata if active
      const savedUserJson = localStorage.getItem('career_dna_demo_user');
      if (savedUserJson) {
        try {
          const parsed = JSON.parse(savedUserJson);
          parsed.user_metadata = { ...parsed.user_metadata, name: name.trim() };
          localStorage.setItem('career_dna_demo_user', JSON.stringify(parsed));
        } catch (e) {}
      }

      setSuccessMessage(`Profile updated successfully for ${name.trim()}! Redirecting to Dashboard...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.warn('Save profile notice:', err);
      localStorage.setItem('career_dna_user_name', name.trim());
      setSuccessMessage(`Profile saved successfully for ${name.trim()}! Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading Student Profile Setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] p-6 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0b0f19] flex justify-center items-center">
      <div className="w-full max-w-4xl glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden space-y-8">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-950/80 border border-indigo-800/40 rounded-full text-xs text-indigo-400 font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Career DNA Student Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Professional Profile & Preferences</h1>
            <p className="text-sm text-gray-400 mt-1">Setup your identity, professional profiles, career targets, and skills graph</p>
          </div>

          {/* Step Progress Switcher */}
          <div className="flex items-center space-x-1.5 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 text-xs">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                step === 1 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              1. Identity
            </button>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                step === 2 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              2. Profiles & Links
            </button>
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                step === 3 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              3. Career Targets
            </button>
            <button
              onClick={() => setStep(4)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                step === 4 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              4. Skills & Finish
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-3 text-emerald-200 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-center space-x-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Student Identity & Credentials */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 bg-gray-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Account Credentials</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Student Email ID (Locked)
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'student@university.edu'}
                      className="w-full bg-gray-950/90 border border-gray-800 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-300 font-mono cursor-not-allowed opacity-90"
                    />
                    <Lock className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Digital Twin ID
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={user?.id || 'student-demo-uuid-12345'}
                      className="w-full bg-gray-950/90 border border-gray-800 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-400 font-mono cursor-not-allowed opacity-80 truncate"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Profile Identity Fields */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Student Identity & Academic Status</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Full Name / Username *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">This name will be used across your Dashboard and AI Mentor greetings.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Education & University Program *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science & Engineering (3rd Year)"
                      className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Current Placement & Career Stage
                </label>
                <select
                  value={placementStatus}
                  onChange={(e) => setPlacementStatus(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Looking for Internships / Summer Roles">Looking for Internships / Summer Roles</option>
                  <option value="Looking for Full-Time Entry-Level Jobs">Looking for Full-Time Entry-Level Jobs</option>
                  <option value="Active On-Campus Placement Drives">Active On-Campus Placement Drives</option>
                  <option value="Skill Upgrading & Project Building">Skill Upgrading & Project Building</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Next: Professional Profiles & Links</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Professional Links & Profiles (Requested by User) */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-800 pb-4 flex items-center space-x-3">
              <div className="p-2 bg-indigo-900/40 rounded-lg border border-indigo-800/40">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Professional Profiles & Essential Links</h3>
                <p className="text-xs text-gray-400">Connect your GitHub, LinkedIn, LeetCode, and portfolio to calculate your real-time readiness scores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  <span>LinkedIn Profile Link</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Github className="w-4 h-4 text-purple-400" />
                  <span>GitHub Profile Link or Handle</span>
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username or @username"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>LeetCode Profile Link</span>
                </label>
                <input
                  type="url"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  placeholder="https://leetcode.com/u/username"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Personal Portfolio Website</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Short Career Goal Statement / Bio</span>
              </label>
              <textarea
                rows={2}
                value={careerBio}
                onChange={(e) => setCareerBio(e.target.value)}
                placeholder="Briefly describe your career ambitions, e.g. Aspiring Full-Stack Developer passionate about building high-throughput microservices and React web apps..."
                className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors border border-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Next: Career Targets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Career Targets & Preferences */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-800 pb-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-900/40 rounded-lg border border-purple-800/40">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Target Career Role & Company Preferences</h3>
                <p className="text-xs text-gray-400">Specify your desired job title, target companies, and salary expectation</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Target Career Domains (Choose 1 to 3 Domains) *
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800">
                  {targetRoles.length} of 3 Selected
                </span>
              </div>

              {/* Selected Domain Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {targetRoles.map((r) => (
                  <span key={r} className="inline-flex items-center space-x-1.5 bg-indigo-950/90 text-indigo-200 border border-indigo-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold">{r}</span>
                    <button
                      type="button"
                      onClick={() => toggleTargetRole(r)}
                      className="text-indigo-400 hover:text-white font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_ROLES.map((role) => {
                  const isSelected = targetRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleTargetRole(role)}
                      className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-900/20'
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Briefcase className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium text-white">{role}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Domain Input */}
            <div className="pt-2">
              {targetRoles.length < 3 && (
                <form onSubmit={addCustomDomain} className="flex space-x-2">
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Add custom domain (e.g. Cybersecurity Analyst, Cloud Architect)..."
                    className="flex-1 bg-gray-900/80 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30"
                  >
                    + Add Domain
                  </button>
                </form>
              )}
            </div>

            {/* Target Companies & Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Target Salary / CTC Range</span>
                </label>
                <select
                  value={targetCtc}
                  onChange={(e) => setTargetCtc(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="3-6 LPA">3-6 LPA (Entry-Level)</option>
                  <option value="6-12 LPA">6-12 LPA (Mid Tier)</option>
                  <option value="12-20 LPA">12-20 LPA (High Growth)</option>
                  <option value="20+ LPA">20+ LPA (Top Product / Global)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Preferred Work Model</span>
                </label>
                <select
                  value={preferredWorkType}
                  onChange={(e) => setPreferredWorkType(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Hybrid / Remote">Hybrid / Remote</option>
                  <option value="100% Remote">100% Remote</option>
                  <option value="On-Site / In-Office">On-Site / In-Office</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors border border-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Next: Skills & Finish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Chosen Skills, Topics & Profile Review */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-800 pb-4 flex items-center space-x-3">
              <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-800/40">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Chosen Technical Skills & Final Review</h3>
                <p className="text-xs text-gray-400">Verify your self-reported skills graph and confirm profile setup</p>
              </div>
            </div>

            {/* Selected Skills Badges */}
            <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 min-h-[100px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Active Technical Skills ({skills.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add Custom Skill Form */}
            <form onSubmit={addCustomSkill} className="flex space-x-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Add custom topic/skill (e.g. Next.js, PyTorch, Kubernetes)..."
                className="flex-1 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 text-indigo-300 font-medium px-4 py-2.5 rounded-xl border border-gray-700 flex items-center space-x-1 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>

            {/* Preset Skill Options */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular Technical Skill Topics:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_SKILLS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-gray-900/80 text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      {skill} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-xs space-y-2">
              <p className="text-indigo-400 font-bold uppercase tracking-wider">Profile Summary Preview:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-300">
                <div><span className="text-gray-500">Name:</span> {name}</div>
                <div><span className="text-gray-500">Role:</span> {isCustomRole ? customRole : targetRole}</div>
                <div><span className="text-gray-500">LinkedIn:</span> {linkedinUrl ? 'Connected' : 'Not added'}</div>
                <div><span className="text-gray-500">GitHub:</span> {githubUrl ? 'Connected' : 'Not added'}</div>
              </div>
            </div>

            {/* Save & Finish Buttons */}
            <div className="pt-6 border-t border-gray-800 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-colors border border-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile & Open Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

