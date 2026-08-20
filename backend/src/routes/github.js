import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyzeGitHubProfile } from '../services/githubAnalyzer.js';

const router = express.Router();

export const memoryGithubStore = {};

// POST /api/github/connect - Connect GitHub username, fetch stats, store quality score & skills
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    // 1. Analyze GitHub Profile via REST API
    const analysis = await analyzeGitHubProfile(username);

    let githubRecord = {
      student_id: studentId,
      username: analysis.username,
      repo_stats_json: analysis.repo_stats_json,
      project_quality_score: analysis.project_quality_score,
      fetched_at: new Date().toISOString()
    };

    // 2. Save into github_profiles DB table if available
    try {
      const { data, error: githubError } = await supabaseAdmin
        .from('github_profiles')
        .upsert(githubRecord, { onConflict: 'student_id' })
        .select()
        .single();

      if (!githubError && data) {
        githubRecord = data;
      }
    } catch (e) {}

    memoryGithubStore[studentId] = githubRecord;

    // 3. Merge extracted GitHub skills into skill_graph table (source: 'github')
    if (Array.isArray(analysis.skills_extracted) && analysis.skills_extracted.length > 0) {
      const skillsToInsert = analysis.skills_extracted.map(skillName => ({
        student_id: studentId,
        skill_name: skillName,
        source: 'github',
        confidence_score: 0.85
      }));

      try {
        await supabaseAdmin
          .from('skill_graph')
          .upsert(skillsToInsert, { onConflict: 'student_id,skill_name,source' });
      } catch (e) {}
    }

    return res.status(200).json({
      message: 'GitHub profile connected and analyzed successfully',
      github_profile: githubRecord,
      project_quality_score: analysis.project_quality_score,
      skills_extracted: analysis.skills_extracted
    });
  } catch (err) {
    console.error('GitHub connect endpoint error:', err);
    return res.status(400).json({ error: err.message || 'Failed to connect GitHub profile.' });
  }
});

// GET /api/github/latest - Fetch student's connected GitHub profile
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (memoryGithubStore[studentId]) {
      return res.status(200).json({ github_profile: memoryGithubStore[studentId] });
    }

    let githubRecord = null;
    try {
      const { data } = await supabaseAdmin
        .from('github_profiles')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();
      if (data) githubRecord = data;
    } catch (e) {}

    if (githubRecord) {
      memoryGithubStore[studentId] = githubRecord;
    }

    return res.status(200).json({ github_profile: githubRecord });
  } catch (err) {
    console.error('Fetch latest github profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch GitHub profile.' });
  }
});

export default router;
