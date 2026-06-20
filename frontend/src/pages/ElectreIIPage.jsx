import React, { useState, useEffect } from 'react'
import api from '../api'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import MatrixEditor from '../components/MatrixEditor'
import ParamInputs from '../components/ParamInputs'
import NameEditor from '../components/NameEditor'
import ResultsTable from '../components/ResultsTable'
import GraphViewCytoscape from '../components/GraphViewCytoscape'
import Heatmap from '../components/Heatmap'
import Step from '../components/StepRail'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer } from 'recharts'

const PARAM_LABELS = {
  criteria: 'Critérios',
  alternatives: 'Alternativas',
  eii_cp: 'Concordância forte (c⁺)',
  eii_c: 'Concordância (c)',
  eii_cm: 'Concordância fraca (c⁻)',
  eii_d1: 'Discordância forte (d1)',
  eii_d2: 'Discordância fraca (d2)',
  maximum_cycles: 'Máx. de ciclos',
}

const PARAM_HELPERS = {
  criteria: 'Quantidade de critérios avaliados',
  alternatives: 'Quantidade de alternativas comparadas',
  eii_cp: 'Concordância mínima para relação forte',
  eii_c: 'Concordância mínima para relação intermediária',
  eii_cm: 'Concordância mínima para relação fraca',
  eii_d1: 'Discordância máxima para relação forte',
  eii_d2: 'Discordância máxima para relação fraca',
  maximum_cycles: 'Iterações máximas da distilação',
}

function SectionCard({ children }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  )
}

export default function ElectreIIPage() {
  const [criteria, setCriteria] = useState(3)
  const [alternatives, setAlternatives] = useState(3)
  const [criteriaNames, setCriteriaNames] = useState(Array.from({ length: 3 }, () => ''))
  const [altNames, setAltNames] = useState(Array.from({ length: 3 }, () => ''))
  const [matrix, setMatrix] = useState(Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => '')))
  const [weights, setWeights] = useState(Array.from({ length: 3 }, () => ''))
  const [eiiParams, setEiiParams] = useState({
    eii_cp: '0.65',
    eii_c: '0.75',
    eii_cm: '0.85',
    eii_d1: '0.25',
    eii_d2: '0.5',
    maximum_cycles: '30',
  })
  const [result, setResult] = useState([])
  const [graphPayload, setGraphPayload] = useState({ performance: [], weights: [] })
  const [rankingData, setRankingData] = useState([])
  const [credibilityMatrix, setCredibilityMatrix] = useState(null)
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const criteriaDisplay = Array.from({ length: criteria }, (_, i) => (criteriaNames[i] || '').trim() || `C${i + 1}`)
  const altDisplay = Array.from({ length: alternatives }, (_, i) => (altNames[i] || '').trim() || `A${i + 1}`)

  // O back-end identifica alternativas como "A1", "A2"... esta função traduz
  // esse id para o nome escolhido pelo usuário (se houver).
  const altNameFor = (id) => {
    const match = String(id).match(/(\d+)\s*$/)
    if (!match) return id
    const idx = parseInt(match[1], 10) - 1
    return altDisplay[idx] || id
  }

  const callSolve = async () => {
    setError(null)
    setLoading(true)
    try {
      const perf = matrix.map((r) => r.map((vv) => parseFloat(vv || '0')))
      const body = {
        performance: perf,
        weights: weights.map((x) => parseFloat(x || '0')),
        eii_cp: parseFloat(eiiParams.eii_cp),
        eii_c: parseFloat(eiiParams.eii_c),
        eii_cm: parseFloat(eiiParams.eii_cm),
        eii_d1: parseFloat(eiiParams.eii_d1),
        eii_d2: parseFloat(eiiParams.eii_d2),
        maximum_cycles: parseInt(eiiParams.maximum_cycles),
      }
      const res = await api.post('/electre/ii', body)
      setResult(res.data.result)
      setGraphPayload(body)
      setTab(0)
    } catch (err) {
      console.error(err)
      setError('Não foi possível calcular. Confira os dados informados e a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function fetchRanking() {
      if (!graphPayload || !graphPayload.performance || graphPayload.performance.length === 0) return
      try {
        const res = await api.post('/graph/data/ii', graphPayload)
        const ranks = res.data.rankings || []
        setCredibilityMatrix(res.data.credibility || null)
        const data = ranks.map((r) => ({ alt: r.alt, name: altNameFor(r.alt), avg: r.avg ?? r.value ?? null, asc: r.asc, desc: r.desc }))
        data.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
        setRankingData(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchRanking()
  }, [graphPayload])

  const handleParamChange = (p) => {
    const nextCriteria = p.criteria !== undefined ? parseInt(p.criteria) || 1 : criteria
    const nextAlternatives = p.alternatives !== undefined ? parseInt(p.alternatives) || 1 : alternatives

    if (p.criteria !== undefined) setCriteria(nextCriteria)
    if (p.alternatives !== undefined) setAlternatives(nextAlternatives)

    if (p.criteria !== undefined || p.alternatives !== undefined) {
      setWeights((prev) => {
        const next = Array(nextCriteria).fill('')
        for (let i = 0; i < Math.min(prev.length, nextCriteria); i++) next[i] = prev[i]
        return next
      })
      setCriteriaNames((prev) => {
        const next = Array(nextCriteria).fill('')
        for (let i = 0; i < Math.min(prev.length, nextCriteria); i++) next[i] = prev[i]
        return next
      })
      setAltNames((prev) => {
        const next = Array(nextAlternatives).fill('')
        for (let i = 0; i < Math.min(prev.length, nextAlternatives); i++) next[i] = prev[i]
        return next
      })
      setMatrix((prev) => {
        const next = Array.from({ length: nextAlternatives }, () => Array(nextCriteria).fill(''))
        for (let i = 0; i < Math.min(prev.length, nextAlternatives); i++) {
          if (prev[i]) {
            for (let j = 0; j < Math.min(prev[i].length, nextCriteria); j++) next[i][j] = prev[i][j]
          }
        }
        return next
      })
    }

    setEiiParams((prev) => ({ ...prev, ...p }))
  }

  const hasResults = result && result.length > 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>
        Calculadora ELECTRE II
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
        Compare alternativas por múltiplos critérios e obtenha um ranking baseado em relações de
        sobreclassificação. Preencha as três etapas abaixo e calcule.
      </Typography>

      <Step number="01" title="Defina o problema" description="Quantos critérios e alternativas você vai comparar, e com quais parâmetros do método.">
        <SectionCard>
          <ParamInputs
            params={{ criteria, alternatives, ...eiiParams }}
            labels={PARAM_LABELS}
            helpers={PARAM_HELPERS}
            onChange={handleParamChange}
          />
          <Divider sx={{ my: 2.5 }} />
          <NameEditor
            title="Nomes dos critérios (opcional)"
            count={criteria}
            values={criteriaNames}
            onChange={setCriteriaNames}
            prefix="C"
          />
          <NameEditor
            title="Nomes das alternativas (opcional)"
            count={alternatives}
            values={altNames}
            onChange={setAltNames}
            prefix="A"
          />
        </SectionCard>
      </Step>

      <Step number="02" title="Pesos dos critérios" description="O peso relativo de cada critério na comparação.">
        <SectionCard>
          <MatrixEditor rows={1} cols={criteria} value={[weights]} onChange={(v) => setWeights(v[0])} colLabels={criteriaDisplay} rowLabels={['Peso']} />
        </SectionCard>
      </Step>

      <Step number="03" title="Matriz de desempenho" description="O valor de cada alternativa em cada critério.">
        <SectionCard>
          <MatrixEditor
            rows={alternatives}
            cols={criteria}
            value={matrix}
            onChange={setMatrix}
            rowLabels={altDisplay}
            colLabels={criteriaDisplay}
          />
        </SectionCard>
      </Step>

      <Step
        number="04"
        title="Resultado"
        last
        description="O ranking final, o grafo de sobreclassificação e a matriz de credibilidade entre as alternativas."
      >
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={callSolve}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <PlayArrowRoundedIcon />}
            disabled={loading}
          >
            {loading ? 'Calculando…' : 'Calcular'}
          </Button>
          {error && <Alert severity="error" sx={{ flex: 1 }}>{error}</Alert>}
        </Box>

        <SectionCard>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{ mb: 2, minHeight: 36, borderBottom: '1px solid #D8DAD2' }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Ranking" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Tabela" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Grafo" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Mapa de credibilidade" sx={{ minHeight: 36, textTransform: 'none' }} />
          </Tabs>

          {tab === 0 && (
            hasResults && rankingData.length > 0 ? (
              <Box sx={{ height: Math.max(240, rankingData.length * 46) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankingData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E0" />
                    <XAxis type="number" stroke="#4B5A53" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#4B5A53" fontSize={12} width={90} />
                    <Tooltip
                      formatter={(value) => [Number(value).toFixed(3), 'Pontuação média']}
                      labelFormatter={(label) => label}
                      contentStyle={{ borderRadius: 8, borderColor: '#D8DAD2', fontFamily: 'Inter' }}
                    />
                    <Bar dataKey="avg" fill="#2F6F64" radius={[0, 6, 6, 0]} barSize={22}>
                      <LabelList dataKey="avg" position="right" formatter={(v) => Number(v).toFixed(2)} fill="#4B5A53" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Calcule para ver o ranking das alternativas, da melhor para a pior.
              </Typography>
            )
          )}

          {tab === 1 && <ResultsTable data={result} />}

          {tab === 2 && <GraphViewCytoscape method="ii" payload={graphPayload} labelFor={altNameFor} />}

          {tab === 3 && <Heatmap matrix={credibilityMatrix} labels={altDisplay} />}
        </SectionCard>
      </Step>
    </Box>
  )
}