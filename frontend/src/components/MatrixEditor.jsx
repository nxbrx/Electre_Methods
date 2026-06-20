import React from 'react'
import { Box, Typography } from '@mui/material'
import { dataFont } from '../theme'

/**
 * Editor de matriz genérico.
 * rowLabels / colLabels são opcionais — se não vierem, usamos índices (L1, C1...).
 */
export default function MatrixEditor({ rows, cols, value, onChange, rowLabels, colLabels, cellWidth = 84 }) {
  const handleCell = (r, c, v) => {
    const copy = Array.from({ length: rows }).map((_, rowIndex) => {
      const originalRow = value[rowIndex] || []
      return Array.from({ length: cols }).map((_, colIndex) => {
        return originalRow[colIndex] !== undefined ? originalRow[colIndex] : ''
      })
    })
    copy[r][c] = v
    onChange(copy)
  }

  const colHeader = (c) => (colLabels && colLabels[c] !== undefined ? colLabels[c] : `C${c + 1}`)
  const rowHeader = (r) => (rowLabels && rowLabels[r] !== undefined ? rowLabels[r] : `L${r + 1}`)

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box sx={{ display: 'inline-block', minWidth: '100%' }}>
        {/* cabeçalho de colunas */}
        <Box sx={{ display: 'flex', pl: '92px', mb: 0.5 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Box key={`h-${c}`} sx={{ width: cellWidth, mr: 1, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontFamily: dataFont, color: 'text.secondary', fontWeight: 600 }}>
                {colHeader(c)}
              </Typography>
            </Box>
          ))}
        </Box>

        {Array.from({ length: rows }).map((_, r) => (
          <Box key={`row-${r}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
            <Box sx={{ width: 84, mr: 1, flexShrink: 0 }}>
              <Typography
                variant="caption"
                sx={{ fontFamily: dataFont, color: 'text.secondary', fontWeight: 600 }}
                noWrap
              >
                {rowHeader(r)}
              </Typography>
            </Box>
            {Array.from({ length: cols }).map((_, c) => {
              const cellValue = (value[r] && value[r][c]) !== undefined ? value[r][c] : ''
              return (
                <input
                  key={`cell-${r}-${c}`}
                  value={cellValue}
                  onChange={(e) => handleCell(r, c, e.target.value)}
                  inputMode="decimal"
                  style={{
                    width: cellWidth,
                    marginRight: 8,
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid #D8DAD2',
                    background: '#FFFFFF',
                    textAlign: 'center',
                    fontFamily: dataFont,
                    fontSize: '0.85rem',
                    color: '#16201C',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2F6F64')}
                  onBlur={(e) => (e.target.style.borderColor = '#D8DAD2')}
                />
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}