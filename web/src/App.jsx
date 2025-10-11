import React from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { SnackbarProvider } from 'notistack'
import DocumentGenerator from './components/DocumentGenerator'
import Pricing from './components/Pricing'

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            NNL AI Admin
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Generate business documents for African SMEs
          </Typography>
        </Box>
        <DocumentGenerator />
        <Box sx={{ mt: 8 }}>
          <Pricing />
        </Box>
      </Container>
    </SnackbarProvider>
  )
}