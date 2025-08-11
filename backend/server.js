const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { z } = require('zod');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OpenAI = require('openai');

const app = express();

// Logging
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// Body parser
app.use(express.json({ limit: '1mb' }));

// CORS hardening
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed from this origin'), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nzima-admin-ai-backend' });
});

// OpenAI client (lazy init)
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

// Validation schema
const GenerateDocumentSchema = z.object({
  docType: z.string().min(2).max(64),
  context: z.string().min(1).max(4000),
  userId: z.string().min(1).max(128).optional()
});

// AI Document Generator
app.post('/api/generate-document', async (req, res, next) => {
  try {
    const parse = GenerateDocumentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', details: parse.error.flatten() });
    }

    const client = createOpenAIClient();
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'AI provider not configured. Set OPENAI_API_KEY in backend/.env or as an environment variable.'
      });
    }

    const { docType, context } = parse.data;

    const prompt = `Generate a professional ${docType} document for a South African SME.\nContext: ${context}\n\nRequirements:\n- Use clear, formal business language\n- Be concise but complete\n- Include relevant sections and headings`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert business document assistant for African SMEs.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1200
    });

    const content = completion.choices?.[0]?.message?.content || '';
    if (!content) {
      return res.status(502).json({ error: 'BadGateway', message: 'Empty response from AI provider' });
    }

    return res.json({ document: content });
  } catch (err) {
    req.log.error({ err }, 'AI generation failed');
    return next(err);
  }
});

// Centralized error handler (no secrets leakage)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status >= 500 ? 'InternalServerError' : (err.message || 'Error');
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`[nzima-admin-ai] Backend server running on port ${PORT}`);
});