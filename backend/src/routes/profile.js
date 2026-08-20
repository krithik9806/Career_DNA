import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyzeGitHubProfile } from '../services/githubAnalyzer.js';
import { memoryGithubStore } from './github.js';

const router = express.Router();

// Memory store fallback if Supabase DB is unconfigured
export const memoryStudentStore = {};
export const memorySkillsStore = {};

// POST /api/profile - Create or update student profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      name,
      target_role,
      target_roles,
      education,
      placement_status,
      linkedin_url,
      github_url,
      leetcode_url,
      portfolio_url,
      target_companies,
      target_ctc,
      preferred_work_type,
      career_bio,
      self_reported_skills,
      focus_areas
    } = req.body;

    if (!name || (!target_role && !target_roles) || !education) {
      return res.status(400).json({ error: 'Name, target role, and education are required.' });
    }

    const rolesArray = Array.isArray(target_roles) && target_roles.length > 0
      ? target_roles.slice(0, 3)
      : (target_role ? target_role.split(',').map(r => r.trim()).filter(Boolean).slice(0, 3) : ['Full-Stack Web Developer']);

    const targetRoleString = rolesArray.join(', ');

    // Extract GitHub username if URL or handle provided
    let extractedGithubUser = '';
    if (github_url) {
      const cleanGh = github_url.trim().replace(/\/$/, '');
      if (cleanGh.includes('github.com/')) {
        extractedGithubUser = cleanGh.split('github.com/').pop().split('/')[0];
      } else {
        extractedGithubUser = cleanGh.replace(/^@/, '');
      }
    }

    let studentRecord = {
      id: studentId,
      email: req.user.email,
      name: name.trim(),
      target_role: targetRoleString,
      target_roles: rolesArray,
      education: education.trim(),
      placement_status: placement_status || 'Looking for Internships / Jobs',
      linkedin_url: linkedin_url ? linkedin_url.trim() : '',
      github_url: github_url ? github_url.trim() : '',
      github_username: extractedGithubUser,
      leetcode_url: leetcode_url ? leetcode_url.trim() : '',
      portfolio_url: portfolio_url ? portfolio_url.trim() : '',
      target_companies: Array.isArray(target_companies) ? target_companies : [],
      target_ctc: target_ctc || '',
      preferred_work_type: preferred_work_type || 'Hybrid / Remote',
      career_bio: career_bio ? career_bio.trim() : '',
      created_at: new Date().toISOString()
    };

    // Try Supabase Database
    try {
      const { data, error } = await supabaseAdmin
        .from('students')
        .upsert(studentRecord, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        studentRecord = data;
      }
    } catch (dbErr) {
      console.warn('[DB NOTICE] Using memory store for profile update:', dbErr.message);
    }

    memoryStudentStore[studentId] = studentRecord;

    // Auto-link and analyze GitHub profile if username provided
    if (extractedGithubUser) {
      try {
        const analysis = await analyzeGitHubProfile(extractedGithubUser);
        const ghObj = {
          student_id: studentId,
          username: analysis.username,
          repo_stats_json: analysis.repo_stats_json,
          project_quality_score: analysis.project_quality_score,
          fetched_at: new Date().toISOString()
        };
        memoryGithubStore[studentId] = ghObj;
        try {
          await supabaseAdmin.from('github_profiles').upsert(ghObj, { onConflict: 'student_id' });
        } catch (e) {}
      } catch (ghErr) {
        console.warn('[PROFILE GITHUB NOTICE]', ghErr.message);
      }
    }

    // Save self-reported skills
    let insertedSkills = [];
    if (Array.isArray(self_reported_skills) && self_reported_skills.length > 0) {
      const skillsToInsert = self_reported_skills
        .filter(s => typeof s === 'string' && s.trim().length > 0)
        .map(skill => ({
          student_id: studentId,
          skill_name: skill.trim(),
          source: 'self_reported',
          confidence_score: 1.00
        }));

      try {
        const { data: skillData } = await supabaseAdmin
          .from('skill_graph')
          .upsert(skillsToInsert, { onConflict: 'student_id,skill_name,source' })
          .select();
        if (skillData) insertedSkills = skillData;
      } catch (dbErr) {
        // fallback
      }

      memorySkillsStore[studentId] = skillsToInsert;
    }

    return res.status(200).json({
      message: 'Profile saved successfully',
      student: studentRecord,
      self_reported_skills: (memorySkillsStore[studentId] || []).map(s => s.skill_name || s)
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update student profile' });
  }
});

// GET /api/profile - Get student onboarding profile + self-reported skills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    let student = memoryStudentStore[studentId] || null;
    let selfReportedSkills = (memorySkillsStore[studentId] || []).map(s => s.skill_name || s);

    try {
      const { data: dbStudent } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      if (dbStudent) student = dbStudent;

      const { data: dbSkills } = await supabaseAdmin
        .from('skill_graph')
        .select('skill_name')
        .eq('student_id', studentId)
        .eq('source', 'self_reported');

      if (dbSkills && dbSkills.length > 0) {
        selfReportedSkills = dbSkills.map(s => s.skill_name);
      }
    } catch (dbErr) {
      // fallback to memory store
    }

    // Default student profile if empty
    if (!student) {
      student = {
        id: studentId,
        email: req.user.email,
        name: req.user.user_metadata?.name || 'Student',
        target_role: 'Full-Stack Web Developer',
        education: 'B.Tech Computer Science & Engineering',
        placement_status: 'Looking for Internships / Jobs',
        linkedin_url: '',
        github_url: '',
        github_username: '',
        leetcode_url: '',
        portfolio_url: '',
        target_companies: ['Top Product Companies', 'High-Growth Startups'],
        target_ctc: '6-12 LPA',
        preferred_work_type: 'Hybrid / Remote',
        career_bio: ''
      };
      selfReportedSkills = ['JavaScript', 'React', 'Git', 'Node.js', 'HTML/CSS', 'SQL'];
    }

    return res.status(200).json({
      student,
      self_reported_skills: selfReportedSkills
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
