import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
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

// AI Coach endpoint powered by Gemini AI
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { message, history, userProfile } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: `Hello ${userProfile?.name || 'Mind Explorer'}! I'm Jeevu, your MindForge AI Coach. (Running in offline preview mode). Based on your current stats, practicing Memory Matrix and Mental Math today will accelerate your processing speed and working memory!`,
        suggestions: ['Analyze my weak skills', 'How can I improve working memory?', 'Recommend today\'s practice plan', 'Predict my 30-day score growth'],
        recommendedGameId: 'memory_matrix',
        takeawayTip: 'Consistent 10-minute daily training builds stronger neural pathways than sporadic long sessions.'
      });
    }

    const systemInstruction = `You are "Jeevu", an advanced AI Cognitive Coach & Master Mind Trainer for BrainVerse MindForge.
User Profile: Name ${userProfile?.name || 'Explorer'}, Level ${userProfile?.level || 1}, Streak ${userProfile?.streak || 0} days, Overall Brain Score ${userProfile?.brainScore || 1200}.
Skill Ratings:
- Memory: ${userProfile?.ratings?.memory || 1000}
- Logic: ${userProfile?.ratings?.logic || 1000}
- Focus: ${userProfile?.ratings?.focus || 1000}
- Math: ${userProfile?.ratings?.math || 1000}
- Attention: ${userProfile?.ratings?.attention || 1000}
- Speed: ${userProfile?.ratings?.speed || 1000}
User's Goals: ${userProfile?.goals?.join(', ') || 'General cognitive fitness and peak mental performance'}.

Your objective is to provide high-intelligence, personalized cognitive coaching grounded in cognitive neuroscience, memory chunking techniques, attention focus strategies, and logical reasoning practices.
If relevant to the user's question, recommend one of the available mini-game IDs:
- "memory_matrix" (for working memory)
- "number_sequence" (for pattern recognition)
- "mental_math" (for processing speed & calculation)
- "maze_escape" (for spatial planning)
- "sudoku" (for logical deduction)
- "quick_decision" (for reaction speed)
- "word_intelligence" (for verbal fluency)
- "coding_logic" (for algorithmic thinking)
- "brain_lab" (for experimental cognitive tests)

Respond with JSON adhering to the specified schema. Keep your tone energizing, friendly, professional, and clear.`;

    // Construct prompt including recent conversation history if present
    let historyContext = '';
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      historyContext = 'Recent conversation context:\n' + recent.map(h => `${h.sender === 'user' ? 'User' : 'Jeevu'}: ${h.text}`).join('\n') + '\n\n';
    }

    const prompt = `${historyContext}User Request: "${message}"\n\nProvide personalized cognitive coaching advice, follow-up suggestions, a golden takeaway tip, and an optional recommended mini-game ID if applicable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'Detailed markdown-friendly coaching response' },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 smart follow-up questions the user might ask next'
            },
            recommendedGameId: {
              type: Type.STRING,
              description: 'Optional game ID string: memory_matrix, number_sequence, mental_math, maze_escape, sudoku, quick_decision, word_intelligence, coding_logic, or brain_lab'
            },
            takeawayTip: { type: Type.STRING, description: 'A single concise golden takeaway tip' }
          },
          required: ['reply', 'suggestions']
        }
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      reply: parsed.reply || "Keep pushing your cognitive boundaries every day!",
      suggestions: parsed.suggestions || ['Analyze my weak areas', 'Give me a quick focus tip'],
      recommendedGameId: parsed.recommendedGameId || '',
      takeawayTip: parsed.takeawayTip || ''
    });
  } catch (error: any) {
    console.warn('AI Coach Fallback Triggered:', error?.message);
    res.json({
      reply: `Hello ${req.body?.userProfile?.name || 'Mind Explorer'}! I'm Jeevu, your MindForge AI Coach. Great effort on your cognitive training today! Based on your scores, I recommend practicing Memory Matrix & Mental Math to sharpen your processing speed and working memory.`,
      suggestions: ['How can I improve my memory?', 'Give me a quick focus tip', 'Analyze my weak areas'],
      recommendedGameId: 'memory_matrix',
      takeawayTip: 'Short daily focus sessions build stronger neural plasticity than occasional marathons.'
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
    console.warn('Puzzle Generation Fallback:', error?.message);
    const category = req.body?.category || 'math';
    const fallbackPuzzles = Array.from({ length: 3 }).map((_, i) => ({
      id: `fallback-${Date.now()}-${i}`,
      title: `${category.toUpperCase()} Training ${i + 1}`,
      question: category === 'math' 
        ? `Calculate: ${(i + 4) * 11} - ${(i + 1) * 6}` 
        : category === 'sequence' 
        ? `What comes next: ${3 * (i + 1)}, ${6 * (i + 1)}, ${12 * (i + 1)}, ${24 * (i + 1)}, ?`
        : `If statement X is true, is not(X) false? (Yes/No)`,
      options: category === 'math' 
        ? [`${(i + 4) * 11 - (i + 1) * 6}`, `${(i + 4) * 11 - (i + 1) * 6 + 4}`, `${(i + 4) * 11 - (i + 1) * 6 - 3}`, `${(i + 4) * 11 + 2}`]
        : category === 'sequence' 
        ? [`${48 * (i + 1)}`, `${36 * (i + 1)}`, `${40 * (i + 1)}`, `${50 * (i + 1)}`]
        : ['Yes', 'No', 'Depends', 'Neither'],
      correctAnswer: category === 'math'
        ? `${(i + 4) * 11 - (i + 1) * 6}`
        : category === 'sequence'
        ? `${48 * (i + 1)}`
        : 'Yes',
      explanation: 'Follow logical step-by-step mathematical reduction.',
    }));
    res.json({ puzzles: fallbackPuzzles });
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
