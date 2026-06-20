import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Container, AppBar, Toolbar, Typography, Box } from '@mui/material'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import theme from './theme'
import ElectreIIPage from './pages/ElectreIIPage'
import AboutPage from './pages/AboutPage'

const navLinkStyle = ({ isActive }) => ({
  color: '#FFFFFF',
  opacity: isActive ? 1 : 0.65,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  padding: '6px 4px',
  borderBottom: isActive ? '2px solid #BD8A3F' : '2px solid transparent',
  transition: 'opacity 0.15s ease',
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <TimelineOutlinedIcon sx={{ color: '#BD8A3F' }} />
              <Typography variant="h6" sx={{ color: '#fff', fontSize: '1.15rem' }}>
                J-ELECTRE&nbsp;II
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <NavLink to="/" end style={navLinkStyle}>Calculadora</NavLink>
              <NavLink to="/sobre" style={navLinkStyle}>Sobre o método</NavLink>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Routes>
            <Route path="/" element={<ElectreIIPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)