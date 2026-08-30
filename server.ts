import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/log', (req, res) => {
    require('fs').appendFileSync('client_error.log', JSON.stringify(req.body) + '\n');
    res.json({ ok: true });
  });

  app.post('/api/log_old', (req, res) => {
    console.log('CLIENT ERROR:', req.body);
    res.json({ ok: true });
  });

  app.post('/api/plan-tasks', async (req, res) => {
    try {
      const { goal, projectTitle } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
      }
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const prompt = `You are a productivity expert. Break down the user's project goal into 3 to 5 actionable tasks. 
Project Name: ${projectTitle}
Goal: ${goal}
Each task should have a clear title, a brief description, an estimated time in hours (0.5 to 8), a priority (low, medium, high, urgent), and 1-3 tags.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Actionable task title" },
                description: { type: Type.STRING, description: "Brief details on what needs to be done" },
                estimatedHours: { type: Type.NUMBER, description: "Estimated time in hours" },
                priority: { type: Type.STRING, description: "One of: low, medium, high, urgent" },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-3 relevant tags" }
              },
              required: ["title", "description", "estimatedHours", "priority", "tags"]
            }
          }
        }
      });
      let tasks = [];
      try { tasks = JSON.parse(response.text || '[]'); } catch (e) { console.error('JSON parse error', e); }
      res.json({ tasks });
    } catch (error) {
      console.error('Error with Gemini:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/suggest-locations', async (req, res) => {
    try {
      const { task } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `I have a task: "${task}". Suggest 3 highly relevant nearby locations or practical places I could go to complete this task. Include the name and a brief description.`,
        config: {
          tools: [{ googleMaps: {} }],
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Error with Gemini:', error);
      res.status(500).json({ error: error.message });
    }
  });

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
