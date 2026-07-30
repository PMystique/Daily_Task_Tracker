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
      const { prompt, existingRoutines } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt string is required' });
      }

      const today = new Date().toISOString().split('T')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an elite productivity coach and AI schedule manager.
Given the user's natural language request: "${prompt}"
Current Date: ${today}
Existing Routines in User's Schedule: ${JSON.stringify(existingRoutines || [])}

Analyze the user's request carefully. A single prompt may contain MULTIPLE schedule changes or actions (e.g. changing wake up time, adding a leave home step, blocking time for deep work, or scheduling Thursday Aerobics).
You MUST return an array of actions in the 'actions' property.

CRITICAL RULES FOR PREVENTING DUPLICATE ITEMS & SETTING PROPERTIES:
1. ALWAYS check 'existingRoutines' first before creating a new routine.
   - If an item in the request refers to an existing routine (e.g. updating time or title for "Wake up", "Leave home", "Deep Work", "Stretch"), return an 'EDIT_ROUTINE' action with 'routineToEdit'. Do NOT create a duplicate routine!
   - Only return 'CREATE_ROUTINE' if there is NO matching existing routine in the user's schedule.

2. SPECIFIC DAYS & FREQUENCY:
   - If the user mentions specific days (e.g., "every Thursday", "Mon and Wed", "on Tuesdays"), populate 'specificDays' as an array of 3-letter codes: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] (e.g., ["Thu"]).
   - Frequency can be 'everyday', 'weekdays', or 'weekends'.

3. TIME BLOCKS vs CHECKLIST ITEMS:
   - If the item represents a scheduled focus period or container with a start and end time (e.g. "09:00 AM - 02:00 PM", "Block 9am to 2pm for focused deep work"), set 'isTimeBlock': true.

For each distinct schedule item or intent in the user's request:
- If matching an existing routine: 'EDIT_ROUTINE' with routineToEdit { id, titleToMatch, newTimeSlot, newTitle, newDetails, routineType, frequency, specificDays, isTimeBlock }
- If new routine: 'CREATE_ROUTINE' with routineToCreate { title, details, timeSlot, routineType, frequency, specificDays, isTimeBlock }
- If goal/project: 'CREATE_GOAL' with goal and tasks.

Provide a JSON object containing:
- actionType: 'MULTI_ACTION' (if multiple actions) or 'CREATE_GOAL' | 'CREATE_ROUTINE' | 'EDIT_ROUTINE'
- actions: array of action objects (each having actionType, goal, tasks, routineToCreate, routineToEdit)
- routinesToCreate: aggregated list of routines to create
- routinesToEdit: aggregated list of routine edits`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: { type: Type.STRING },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING },
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
                      },
                    },
                    routineToCreate: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        details: { type: Type.STRING },
                        timeSlot: { type: Type.STRING },
                        routineType: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        specificDays: { type: Type.ARRAY, items: { type: Type.STRING } },
                        isTimeBlock: { type: Type.BOOLEAN },
                      },
                    },
                    routineToEdit: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        titleToMatch: { type: Type.STRING },
                        newTimeSlot: { type: Type.STRING },
                        newTitle: { type: Type.STRING },
                        newDetails: { type: Type.STRING },
                        routineType: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        specificDays: { type: Type.ARRAY, items: { type: Type.STRING } },
                        isTimeBlock: { type: Type.BOOLEAN },
                      },
                    },
                  },
                  required: ['actionType'],
                },
              },
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
                },
              },
              routinesToCreate: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    details: { type: Type.STRING },
                    timeSlot: { type: Type.STRING },
                    routineType: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    specificDays: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isTimeBlock: { type: Type.BOOLEAN },
                  },
                },
              },
              routinesToEdit: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    titleToMatch: { type: Type.STRING },
                    newTimeSlot: { type: Type.STRING },
                    newTitle: { type: Type.STRING },
                    newDetails: { type: Type.STRING },
                    routineType: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    specificDays: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isTimeBlock: { type: Type.BOOLEAN },
                  },
                },
              },
            },
            required: ['actionType'],
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
