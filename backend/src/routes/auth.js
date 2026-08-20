import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Auto-create initial record in public.students table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('students')
        .insert([
          { id: data.user.id, email, name }
        ]);

      if (profileError && profileError.code !== '23505') { // ignore duplicate key if already created
        console.error('Failed to create student record:', profileError);
      }
    }

    return res.status(201).json({
      message: 'Signup successful',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to process signup request' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login request' });
  }
});

export default router;
