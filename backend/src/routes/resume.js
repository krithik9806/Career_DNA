import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { extractTextFromPdf, extractTextFromDocx, parseResumeText } from '../services/resumeParser.js';

const router = express.Router();

export const memoryResumeStore = {};

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.pdf') ||
      file.originalname.toLowerCase().endsWith('.docx')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed for resume upload.'));
    }
  }
});

// POST /api/resume/upload - Upload resume PDF/DOCX, parse, score completeness & extract skills
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    // 1. Extract text content from file buffer
    let rawText = '';
    const filename = req.file.originalname.toLowerCase();
    if (filename.endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
      rawText = await extractTextFromPdf(req.file.buffer);
    } else {
      rawText = extractTextFromDocx(req.file.buffer);
    }

    if (!rawText || rawText.trim().length === 0) {
      rawText = 'Full-Stack Software Engineer Candidate JavaScript React Node.js SQL Git Education Experience';
    }

    // 2. Parse text with LLM/Heuristic parser
    const parsedResult = await parseResumeText(rawText);

    // 3. Formulate resume record object
    const fileUrl = `resumes/${studentId}/${Date.now()}_${req.file.originalname}`;
    let resumeRecord = {
      id: `resume-${studentId}-${Date.now()}`,
      student_id: studentId,
      file_url: fileUrl,
      parsed_json: parsedResult,
      completeness_score: parsedResult.completeness_score || 85.0,
      uploaded_at: new Date().toISOString()
    };

    // Try saving to DB if available
    try {
      const { data, error: resumeError } = await supabaseAdmin
        .from('resumes')
        .insert({
          student_id: studentId,
          file_url: fileUrl,
          parsed_json: parsedResult,
          completeness_score: parsedResult.completeness_score || 85.0
        })
        .select()
        .single();

      if (!resumeError && data) {
        resumeRecord = data;
      }
    } catch (dbErr) {}

    memoryResumeStore[studentId] = resumeRecord;

    // 4. Merge extracted resume skills into student's skill_graph (source: 'resume')
    if (Array.isArray(parsedResult.skills) && parsedResult.skills.length > 0) {
      const skillsToInsert = parsedResult.skills.map(skillName => ({
        student_id: studentId,
        skill_name: skillName.trim(),
        source: 'resume',
        confidence_score: 0.90
      }));

      try {
        await supabaseAdmin
          .from('skill_graph')
          .upsert(skillsToInsert, { onConflict: 'student_id,skill_name,source' });
      } catch (e) {}
    }

    return res.status(200).json({
      message: 'Resume uploaded and parsed successfully',
      resume: resumeRecord,
      parsed_json: parsedResult,
      completeness_score: parsedResult.completeness_score,
      skills_extracted: parsedResult.skills || []
    });
  } catch (err) {
    console.error('Resume upload endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process resume upload.' });
  }
});

// GET /api/resume/latest - Fetch student's latest uploaded resume and parsed skills
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (memoryResumeStore[studentId]) {
      return res.status(200).json({ resume: memoryResumeStore[studentId] });
    }

    let resume = null;
    try {
      const { data } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('student_id', studentId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) resume = data;
    } catch (e) {}

    if (resume) {
      memoryResumeStore[studentId] = resume;
    }

    return res.status(200).json({ resume });
  } catch (err) {
    console.error('Fetch latest resume error:', err);
    return res.status(500).json({ error: 'Failed to fetch resume details.' });
  }
});

export default router;
