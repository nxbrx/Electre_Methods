import { createTheme } from '@mui/material/styles'

// Sistema de tokens do J-ELECTRE II
// Paleta: papel pedra fria + tinta verde-escura + bronze/latão como destaque
// (inspirada em instrumentos de medição e cadernos técnicos, não em um SaaS genérico)
const tokens = {
  stone: '#EEF0EC',
  paper: '#FFFFFF',
  ink: '#16201C',
  inkSoft: '#4B5A53',
  line: '#D8DAD2',
  teal: '#2F6F64',
  tealDark: '#1F4D45',
  tealLight: '#5C9A8E',
  brass: '#BD8A3F',
  brassDark: '#8F662A',
  rust: '#B5533C',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: tokens.stone,
      paper: tokens.paper,
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.inkSoft,
    },
    primary: {
      main: tokens.teal,
      dark: tokens.tealDark,
      light: tokens.tealLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.brass,
      dark: tokens.brassDark,
      contrastText: '#1A1300',
    },
    error: {
      main: tokens.rust,
    },
    divider: tokens.line,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Source Sans Pro", sans-serif',
    h1: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h2: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h3: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h4: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h5: { fontFamily: '"Source Serif 4", serif', fontWeight: 600, letterSpacing: 0.2 },
    h6: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(22,32,28,0.05) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.ink,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.line}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: tokens.inkSoft,
          backgroundColor: tokens.stone,
        },
      },
    },
  },
})

export const dataFont = '"IBM Plex Mono", "Roboto Mono", monospace'
export default theme
