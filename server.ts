import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  const PORT = 3000;

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Healthcheck Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Coach API Endpoint
  app.post('/api/coach', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt string is required' });
      }

      const today = new Date().toISOString().split('T')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an elite productivity coach and AI schedule generator.
Given the user's natural language request: "${prompt}"
Current Date: ${today}

Generate a structured plan containing:
1. One primary Goal object: title, category (one of 'life', 'work', 'school', 'finance', 'career', 'family-social', 'side-hustle', 'health', 'learning-skills'), description, priority ('urgent' | 'important' | 'normal' | 'low'), targetDueDate (YYYY-MM-DD), tags (array of string tags e.g. ["#WORK", "#DEEP-WORK"]).
2. An array of 2 to 4 linked actionable subtasks: title, priority, category, estimatedMinutes, dueDate (YYYY-MM-DD), tags.
3. An array of 1 to 3 scheduled routine steps: title, details, timeSlot (e.g. "08:00 AM", "07:00 AM - 07:30 AM"), routineType ('morning' | 'evening' | 'weekend').

Ensure all dates are realistic YYYY-MM-DD strings relative to current date ${today}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goal: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  targetDueDate: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'category', 'description', 'priority', 'targetDueDate', 'tags'],
              },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    estimatedMinutes: { type: Type.NUMBER },
                    dueDate: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['title', 'priority', 'estimatedMinutes', 'dueDate'],
                },
              },
              routines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    details: { type: Type.STRING },
                    timeSlot: { type: Type.STRING },
                    routineType: { type: Type.STRING },
                  },
                  required: ['title', 'timeSlot', 'routineType'],
                },
              },
            },
            required: ['goal', 'tasks', 'routines'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error executing Gemini API /api/coach:', err);
      res.status(500).json({ error: err.message || 'Failed to parse prompt with AI Coach' });
    }
  });

  // Vite middleware in dev mode, static serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
