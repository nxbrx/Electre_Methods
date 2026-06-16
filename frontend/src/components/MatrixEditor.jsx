import React from 'react'
import { TextField, Grid } from '@mui/material'

export default function MatrixEditor({ rows, cols, value, onChange }) {
  
  const handleCell = (r, c, v) => {
    // Garante uma cópia perfeitamente alinhada com as dimensões atuais da tela
    const copy = Array.from({ length: rows }).map((_, rowIndex) => {
      const originalRow = value[rowIndex] || []
      return Array.from({ length: cols }).map((_, colIndex) => {
        return originalRow[colIndex] !== undefined ? originalRow[colIndex] : ''
      })
    })

    // Insere o novo caractere digitado pelo usuário
    copy[r][c] = v
    onChange(copy)
  }

  return (
    <Grid container spacing={1}>
      {Array.from({ length: rows }).map((_, r) => (
        <Grid item xs={12} key={`row-${r}`}>
          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: cols }).map((_, c) => {
              // Previne renderizações nulas de dados indefinidos temporariamente
              const cellValue = (value[r] && value[r][c]) !== undefined ? value[r][c] : ''
                return (
                  <TextField
                    size="small"
                    key={`cell-${r}-${c}`}
                    value={cellValue}
                    onChange={e => handleCell(r, c, e.target.value)}
                    style={{ width: 100 }}
                  />
                )
            })}
          </div>
        </Grid>
      ))}
    </Grid>
  )
}
