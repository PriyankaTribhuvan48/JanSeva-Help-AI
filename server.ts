import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeCitizenRequest, generatePolicymakerRecommendation } from './server/geminiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API endpoints
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const result = await analyzeCitizenRequest(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/gemini/recommendation', async (req, res) => {
  try {
    const result = await generatePolicymakerRecommendation(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/recommendation:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/requests', (req, res) => {
  res.json({ success: true, request: req.body });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'JansevaHelp-AI' });
});

// Serve frontend dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JansevaHelp-AI server listening on port ${PORT}`);
});
