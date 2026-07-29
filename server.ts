import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'BrainVerse MindForge AI', timestamp: new Date().toISOString() });
});

// AI Coach endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { message, history, userProfile, gameStats } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: `Hello ${userProfile?.name || 'Mind Explorer'}! I'm Jeevu, your MindForge AI Coach. (Running in offline mode since GEMINI_API_KEY is not set). Based on your recent focus and logic scores, I recommend practicing Memory Matrix and Mental Math today to strengthen your processing speed!`,
        suggestions: ['How can I improve my memory?', 'Give me a quick focus tip', 'Analyze my weak areas'],
      });
    }

    const systemInstruction = `You are "Jeevu", the world-class AI Cognitive Coach for BrainVerse (MindForge).
User Profile: Name ${userProfile?.name || 'Explorer'}, Level ${userProfile?.level || 1}, Streak ${userProfile?.streak || 0} days, Overall Score ${userProfile?.brainScore || 1200}.
Skill Ratings: Memory: ${userProfile?.ratings?.memory || 1000}, Logic: ${userProfile?.ratings?.logic || 1000}, Focus: ${userProfile?.ratings?.focus || 1000}, Math: ${userProfile?.ratings?.math || 1000}, Attention: ${userProfile?.ratings?.attention || 1000}, Speed: ${userProfile?.ratings?.speed || 1000}.
User's Goals: ${userProfile?.goals?.join(', ') || 'General cognitive fitness'}.

Your objective is to provide encouraging, scientifically grounded cognitive training advice, explain mistake patterns, recommend targeted mini-games, and motivate the user. Keep your tone energizing, friendly, concise, and structured.
Important constraint: Frame advice around training cognitive skills like memory, attention, and logic. Do NOT make medical or scientific claims about raising IQ.`;

    const prompt = `User Message: "${message}"\n\nProvide a helpful, motivational response as Jeevu AI Coach. Format with bullet points if helpful, and end with 2 short follow-up question suggestions for the user.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "Keep pushing your cognitive boundaries every day!",
    });
  } catch (error: any) {
    console.error('AI Coach Error:', error);
    res.status(500).json({
      reply: "I noticed a small temporal hiccup in the neural link! Let's stay focused: maintain your daily streak and tackle today's Memory Matrix challenge!",
      error: error?.message,
    });
  }
});

// Dynamic AI Puzzle Generator endpoint
app.post('/api/generate-puzzles', async (req, res) => {
  try {
    const { category, difficulty, count = 3 } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback procedural puzzle generator
      const fallbackPuzzles = Array.from({ length: count }).map((_, i) => ({
        id: `fallback-${Date.now()}-${i}`,
        title: `${category.toUpperCase()} Challenge ${i + 1}`,
        question: category === 'math' 
          ? `Calculate: ${(i + 3) * 12} - ${(i + 1) * 7}` 
          : category === 'sequence' 
          ? `Find the next number in sequence: ${2 * (i + 1)}, ${4 * (i + 1)}, ${8 * (i + 1)}, ${16 * (i + 1)}, ?`
          : `Solve logic rule: If A > B and B > C, then is A > C? (Yes/No)`,
        options: category === 'math' 
          ? [`${(i + 3) * 12 - (i + 1) * 7}`, `${(i + 3) * 12 - (i + 1) * 7 + 5}`, `${(i + 3) * 12 - (i + 1) * 7 - 4}`, `${(i + 3) * 12 + 10}`]
          : category === 'sequence' 
          ? [`${32 * (i + 1)}`, `${24 * (i + 1)}`, `${30 * (i + 1)}`, `${64 * (i + 1)}`]
          : ['Yes', 'No', 'Cannot determine', 'Only if A = B'],
        correctAnswer: category === 'math'
          ? `${(i + 3) * 12 - (i + 1) * 7}`
          : category === 'sequence'
          ? `${32 * (i + 1)}`
          : 'Yes',
        explanation: 'Follow step-by-step logical arithmetic derivation.',
      }));

      return res.json({ puzzles: fallbackPuzzles });
    }

    const prompt = `Generate ${count} engaging, original cognitive training puzzles for category: "${category}" at difficulty level: "${difficulty}".
Format as a strict JSON array of objects with fields:
- "id": unique string
- "title": short creative title
- "question": clear problem prompt or equation
- "options": array of 4 string choices
- "correctAnswer": exact matching string from options
- "explanation": concise breakdown of the solution logic

Return ONLY valid JSON array without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ puzzles: parsed });
  } catch (error: any) {
    console.error('Puzzle Generation Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate puzzles' });
  }
});

// AI Cognitive Roadmap Generator
app.post('/api/ai-roadmap', async (req, res) => {
  try {
    const { age, occupation, dailyTime, goals } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        roadmap: {
          title: 'Custom Cognitive Focus Plan',
          summary: `Designed for ${occupation || 'Learner'} practicing ${dailyTime || '15 mins'} daily focusing on ${goals?.join(', ') || 'overall cognitive sharpness'}.`,
          recommendedDailyRoutine: [
            { time: 'Morning Warmup', game: 'Memory Matrix', duration: '5 mins', focus: 'Working memory' },
            { time: 'Midday Power-up', game: 'Mental Math & Quick Decision', duration: '5 mins', focus: 'Processing speed' },
            { time: 'Evening Challenge', game: 'Maze Escape / Sudoku', duration: '5 mins', focus: 'Logical planning' },
          ],
          projected30DayGrowth: '+18% Memory Retention, +24% Calculation Speed',
        },
      });
    }

    const prompt = `Create a personalized cognitive training roadmap for a user with:
- Age: ${age || '25'}
- Occupation: ${occupation || 'Professional'}
- Daily Practice Time: ${dailyTime || '15 minutes'}
- Goals: ${goals?.join(', ') || 'Improve Memory, Focus, and Processing Speed'}

Return JSON object with keys:
- "title": string roadmap title
- "summary": string summary paragraph
- "recommendedDailyRoutine": array of objects { "time": string, "game": string, "duration": string, "focus": string }
- "projected30DayGrowth": string summary of expected cognitive skill gains`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const roadmap = JSON.parse(response.text || '{}');
    res.json({ roadmap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate AI roadmap' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BrainVerse MindForge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
