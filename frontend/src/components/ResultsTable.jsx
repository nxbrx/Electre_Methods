import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material'
import { dataFont } from '../theme'

/**
 * data: array de linhas (cada linha é um array de células)
 * headers: array opcional de rótulos de coluna
 */
export default function ResultsTable({ data, headers }) {
  if (!data || data.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        Ainda não há resultados. Preencha os dados acima e clique em "Calcular".
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        {headers && (
          <TableHead>
            <TableRow>
              {headers.map((h, i) => (
                <TableCell key={i}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(47,111,100,0.04)' } }}>
              {row.map((cell, j) => (
                <TableCell key={j} sx={{ fontFamily: dataFont, fontSize: '0.85rem' }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}