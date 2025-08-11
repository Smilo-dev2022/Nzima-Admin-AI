const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nzima-admin-ai-backend' });
});

// Placeholder: AI Document Generator
app.post('/api/generate-document', async (req, res) => {
  res.status(501).json({
    error: 'AI not configured',
    message: 'Set OPENAI_API_KEY and implement AI provider before enabling this endpoint.'
  });
});

// Placeholder: Payment creation
app.post('/api/create-payment', async (req, res) => {
  res.status(501).json({
    error: 'Payments not configured',
    message: 'Configure payment gateway credentials and implementation before enabling this endpoint.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[nzima-admin-ai] Backend server running on port ${PORT}`);
});