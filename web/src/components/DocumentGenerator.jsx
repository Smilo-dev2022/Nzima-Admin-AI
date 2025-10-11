import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function DocumentGenerator() {
  const [docType, setDocType] = useState('Proposal')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentText, setDocumentText] = useState('')
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')
    setDocumentText('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/generate-document`, {
        docType,
        context
      })
      setDocumentText(data.document || '')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={2}>
      <TextField label="Document Type" value={docType} onChange={(e) => setDocType(e.target.value)} fullWidth />
      <TextField label="Context" value={context} onChange={(e) => setContext(e.target.value)} fullWidth multiline minRows={4} />
      <Button variant="contained" onClick={handleGenerate} disabled={loading}>
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Generate'}
      </Button>
      {error && (
        <Typography color="error" variant="body2">{error}</Typography>
      )}
      {documentText && (
        <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
          <Typography variant="h6" gutterBottom>Generated Document</Typography>
          <Typography variant="body1">{documentText}</Typography>
        </Paper>
      )}
    </Stack>
  )
}