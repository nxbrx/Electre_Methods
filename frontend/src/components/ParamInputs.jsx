import React from 'react'
import { Grid, TextField } from '@mui/material'

/**
 * params: objeto chave->valor
 * labels: objeto opcional chave->rótulo amigável (em português)
 * helpers: objeto opcional chave->texto de ajuda curto
 */
export default function ParamInputs({ params, labels = {}, helpers = {}, onChange }) {
  const handle = (k, v) => onChange({ ...params, [k]: v })

  return (
    <Grid container spacing={2}>
      {Object.keys(params).map((k) => (
        <Grid item xs={6} sm={4} md={3} key={k}>
          <TextField
            label={labels[k] || k}
            helperText={helpers[k]}
            size="small"
            fullWidth
            value={params[k]}
            onChange={(e) => handle(k, e.target.value)}
          />
        </Grid>
      ))}
    </Grid>
  )
}
