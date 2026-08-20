import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { queryAIMentor } from '../services/ragMentor.js';

const router = express.Router();

// POST /api/mentor/chat - Send message to RAG AI Mentor, receive grounded response
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { message, user_api_key } = req.body;
    const headerApiKey = req.headers['x-gemini-api-key'];
    const apiKeyToUse = user_api_key || headerApiKey || null;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const mentorResult = await queryAIMentor(studentId, message.trim(), apiKeyToUse);

    return res.status(200).json({
      message: mentorResult.message,
      grounded_context: mentorResult.grounded_context
    });
  } catch (err) {
    console.error('Mentor chat endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process AI mentor message.' });
  }
});

// GET /api/mentor/history/:studentId - Fetch chat history
router.get('/history/:studentId', authMiddleware, async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    const { data: history, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ history: history || [] });
  } catch (err) {
    console.error('Fetch mentor chat history error:', err);
    return res.status(500).json({ error: 'Failed to fetch mentor chat history.' });
  }
});

// DELETE /api/mentor/history - Clear chat history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    const { error } = await supabaseAdmin
      .from('chat_history')
      .delete()
      .eq('student_id', studentId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Chat history cleared.' });
  } catch (err) {
    console.error('Clear chat history error:', err);
    return res.status(500).json({ error: 'Failed to clear chat history.' });
  }
});

export default router;
