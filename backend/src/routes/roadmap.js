import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateCareerRoadmap } from '../services/roadmapGenerator.js';
import { memoryStudentStore } from './profile.js';

const router = express.Router();

export const memoryRoadmapStore = {};

// POST /api/roadmap/generate - Diff student skill graph against target role, output prioritized learning roadmap
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    let { targetRole } = req.body;

    // Fetch target role from student profile if not supplied in body
    if (!targetRole) {
      const memStudent = memoryStudentStore[studentId];
      if (memStudent && memStudent.target_role) {
        targetRole = memStudent.target_role;
      } else {
        const { data: student } = await supabaseAdmin
          .from('students')
          .select('target_role')
          .eq('id', studentId)
          .maybeSingle();

        targetRole = student?.target_role || 'Full-Stack Web Developer';
      }
    }

    const roadmapData = await generateCareerRoadmap(studentId, targetRole);
    memoryRoadmapStore[studentId] = roadmapData;

    return res.status(200).json({
      message: 'Personalized career roadmap generated successfully',
      target_role: roadmapData.target_role,
      roadmap_items: roadmapData.roadmap_items,
      completion_percentage: roadmapData.completion_percentage || 0,
      roadmap_data: roadmapData
    });
  } catch (err) {
    console.error('Roadmap generate endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate career roadmap.' });
  }
});

// GET /api/roadmap - Fetch current student roadmap items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check memory store first if available
    if (memoryRoadmapStore[studentId] && memoryRoadmapStore[studentId].roadmap_items?.length > 0) {
      const memData = memoryRoadmapStore[studentId];
      const totalCount = memData.roadmap_items.length;
      const completedCount = memData.roadmap_items.filter(i => i.status === 'completed').length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      memData.completion_percentage = pct;
      return res.status(200).json(memData);
    }

    // Fetch student profile for target role
    const memStudent = memoryStudentStore[studentId];
    let targetRole = memStudent?.target_role || 'Full-Stack Web Developer';

    try {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('target_role')
        .eq('id', studentId)
        .maybeSingle();

      if (student?.target_role) {
        targetRole = student.target_role;
      }
    } catch (e) {}

    let items = [];
    try {
      const { data: dbItems } = await supabaseAdmin
        .from('roadmap_items')
        .select('*')
        .eq('student_id', studentId)
        .order('priority_rank', { ascending: true });

      if (dbItems && dbItems.length > 0) {
        items = dbItems;
      }
    } catch (e) {}

    // If no items exist in DB, auto generate roadmap now!
    if (items.length === 0) {
      const generated = await generateCareerRoadmap(studentId, targetRole);
      memoryRoadmapStore[studentId] = generated;
      return res.status(200).json(generated);
    }

    const totalCount = items.length;
    const completedCount = items.filter(i => i.status === 'completed').length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const responseObj = {
      target_role: targetRole,
      roadmap_items: items,
      completion_percentage: completionPercentage
    };
    memoryRoadmapStore[studentId] = responseObj;

    return res.status(200).json(responseObj);
  } catch (err) {
    console.error('Fetch roadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch student roadmap.' });
  }
});

// PATCH /api/roadmap/:itemId/status - Update item status (pending, in_progress, completed)
router.patch('/:itemId/status', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be pending, in_progress, or completed.' });
    }

    // Update memory store
    if (memoryRoadmapStore[studentId] && memoryRoadmapStore[studentId].roadmap_items) {
      memoryRoadmapStore[studentId].roadmap_items = memoryRoadmapStore[studentId].roadmap_items.map(item =>
        item.id === itemId ? { ...item, status } : item
      );
    }

    try {
      await supabaseAdmin
        .from('roadmap_items')
        .update({ status })
        .eq('id', itemId)
        .eq('student_id', studentId);
    } catch (e) {}

    return res.status(200).json({
      message: 'Roadmap item status updated',
      status
    });
  } catch (err) {
    console.error('Update roadmap item status error:', err);
    return res.status(500).json({ error: 'Failed to update roadmap item status.' });
  }
});

export default router;
