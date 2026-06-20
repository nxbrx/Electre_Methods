import React from 'react'
import { Box, Typography } from '@mui/material'
import { dataFont } from '../theme'

const TEAL = [47, 111, 100] // rgb base do tema

export default function Heatmap({ matrix, labels, cell = 42 }) {
  if (!matrix || matrix.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem dados de credibilidade para exibir ainda.
      </Typography>
    )
  }

  const n = matrix.length
  const altLabels = labels || Array.from({ length: n }, (_, i) => `A${i + 1}`)
  const gutter = 36

  let max = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (Math.abs(matrix[i][j]) > max) max = Math.abs(matrix[i][j])
  if (max === 0) max = 1

  const width = gutter + n * cell
  const height = gutter + n * cell

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
      <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <svg width={width} height={height}>
          {/* rótulos de coluna */}
          {altLabels.map((lab, j) => (
            <text
              key={`cl-${j}`}
              x={gutter + j * cell + cell / 2}
              y={gutter - 10}
              fontSize="11"
              fontFamily={dataFont}
              fill="#4B5A53"
              textAnchor="middle"
            >
              {lab}
            </text>
          ))}
          {/* rótulos de linha */}
          {altLabels.map((lab, i) => (
            <text
              key={`rl-${i}`}
              x={gutter - 10}
              y={gutter + i * cell + cell / 2 + 4}
              fontSize="11"
              fontFamily={dataFont}
              fill="#4B5A53"
              textAnchor="end"
            >
              {lab}
            </text>
          ))}
          {matrix.map((row, i) =>
            row.map((v, j) => {
              const val = Math.abs(v) / max
              const color = `rgba(${TEAL[0]},${TEAL[1]},${TEAL[2]},${0.08 + val * 0.85})`
              return (
                <g key={`${i}-${j}`}>
                  <rect
                    x={gutter + j * cell}
                    y={gutter + i * cell}
                    width={cell - 2}
                    height={cell - 2}
                    rx={3}
                    fill={color}
                  />
                  <title>{`${altLabels[i]} → ${altLabels[j]} = ${Number(v).toFixed(2)}`}</title>
                  {cell >= 34 && (
                    <text
                      x={gutter + j * cell + cell / 2}
                      y={gutter + i * cell + cell / 2 + 4}
                      fontSize="10"
                      fontFamily={dataFont}
                      fill={val > 0.55 ? '#FFFFFF' : '#16201C'}
                      textAnchor="middle"
                    >
                      {Number(v).toFixed(2)}
                    </text>
                  )}
                </g>
              )
            })
          )}
        </svg>
      </Box>

      {/* legenda */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">0</Typography>
        <Box
          sx={{
            width: 120,
            height: 10,
            borderRadius: 1,
            background: `linear-gradient(90deg, rgba(${TEAL[0]},${TEAL[1]},${TEAL[2]},0.08), rgba(${TEAL[0]},${TEAL[1]},${TEAL[2]},0.93))`,
          }}
        />
        <Typography variant="caption" color="text.secondary">{max.toFixed(2)} (credibilidade)</Typography>
      </Box>
    </Box>
  )
}