import React from 'react'
import { Box, Typography } from '@mui/material'
import { dataFont } from '../theme'

/**
 * Elemento de assinatura visual da página: um trilho numerado que conecta as
 * etapas do fluxo (parâmetros → dados → resultado), ecoando a ideia de
 * "relação" entre nós que está no centro do método ELECTRE.
 */
export default function Step({ number, title, description, children, last = false }) {
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: dataFont,
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'primary.main',
            backgroundColor: 'background.paper',
            flexShrink: 0,
          }}
        >
          {number}
        </Box>
        {!last && <Box sx={{ width: 2, flexGrow: 1, backgroundColor: '#D8DAD2', mt: 1, mb: 1, minHeight: 24 }} />}
      </Box>
      <Box sx={{ flex: 1, pb: last ? 0 : 4, minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', mb: 0.25 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  )
}
