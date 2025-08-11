import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import CheckIcon from '@mui/icons-material/Check'
import fallbackData from '../data/plans.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatPrice(plan) {
  const priceText = `${plan.currency} ${plan.price}/mo`
  if (plan.perUser) {
    return `${priceText} per user`
  }
  return `${priceText} up to ${plan.usersIncluded} users`
}

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/plans`)
        setPlans(Array.isArray(data?.plans) ? data.plans : [])
      } catch (err) {
        setPlans(fallbackData.plans || [])
        setError('Loaded fallback pricing')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Stack spacing={2} sx={{ my: 6 }}>
      <Typography variant="h4" textAlign="center" fontWeight={800}>Pricing</Typography>
      <Typography variant="subtitle1" textAlign="center" color="text.secondary">
        Starter is priced per user. Higher tiers include more users by default.
      </Typography>
      {loading && <Typography textAlign="center">Loading plans…</Typography>}
      {error && <Typography textAlign="center" color="warning.main">{error}</Typography>}

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
                  {plan.perUser ? (
                    <Chip label="Per user" size="small" color="primary" />
                  ) : (
                    <Chip label={`Up to ${plan.usersIncluded} users`} size="small" color="secondary" />
                  )}
                </Stack>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {formatPrice(plan)}
                </Typography>
                {plan.highlight && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.highlight}
                  </Typography>
                )}
                <Stack spacing={1}>
                  {(plan.features || []).map((feature, idx) => (
                    <Stack direction="row" alignItems="center" spacing={1} key={idx}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
              <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                <Button variant="contained" fullWidth>Choose {plan.name}</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}