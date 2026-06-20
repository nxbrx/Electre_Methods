import React from 'react'
import { Box, TextField, Typography } from '@mui/material'

/**
 * Lista horizontal de campos de nome, com fallback visual (placeholder) tipo "C1", "A1"...
 * count: quantidade de campos
 * values: array de strings (pode ter posições vazias)
 * prefix: prefixo do placeholder (ex.: "C" ou "A")
 */
export default function NameEditor({ title, count, values, onChange, prefix }) {
  const handle = (i, v) => {
    const next = Array.from({ length: count }, (_, idx) => values[idx] || '')
    next[i] = v
    onChange(next)
  }

  return (
    <Box sx={{ mb: 1 }}>
      {title && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
        {Array.from({ length: count }).map((_, i) => (
          <TextField
            key={i}
            size="small"
            placeholder={`${prefix}${i + 1}`}
            value={values[i] || ''}
            onChange={(e) => handle(i, e.target.value)}
            sx={{ minWidth: 140, flexShrink: 0 }}
          />
        ))}
      </Box>
    </Box>
  )
}
