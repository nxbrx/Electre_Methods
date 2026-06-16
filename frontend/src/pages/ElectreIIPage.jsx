import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, Box, Typography } from '@mui/material'
import MatrixEditor from '../components/MatrixEditor'
import ParamInputs from '../components/ParamInputs'
import ResultsTable from '../components/ResultsTable'
import GraphViewCytoscape from '../components/GraphViewCytoscape'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts'
import Heatmap from '../components/Heatmap'

export default function ElectreIIPage() {
  const [criteria, setCriteria] = useState(2)
  const [alternatives, setAlternatives] = useState(2)
  const [matrix, setMatrix] = useState(Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => '')))
  const [weights, setWeights] = useState(Array.from({ length: 2 }, () => ''))
  const [eiiParams, setEiiParams] = useState({ eii_cp: '0.5', eii_c: '0.5', eii_cm: '0.5', eii_d1: '0', eii_d2: '0', maximum_cycles: '30' })
  const [result, setResult] = useState([])
  const [graphPayload, setGraphPayload] = useState({ performance: [], weights: [] })
  const [rankingData, setRankingData] = useState([])
  const [credibilityMatrix, setCredibilityMatrix] = useState(null)

  const callSolve = async () => {
    const perf = matrix.map(r => r.map(vv => parseFloat(vv || '0')))
    const body = { performance: perf, weights: weights.map(x => parseFloat(x || '0')), eii_cp: parseFloat(eiiParams.eii_cp), eii_c: parseFloat(eiiParams.eii_c), eii_cm: parseFloat(eiiParams.eii_cm), eii_d1: parseFloat(eiiParams.eii_d1), eii_d2: parseFloat(eiiParams.eii_d2), maximum_cycles: parseInt(eiiParams.maximum_cycles) }
    const res = await axios.post('/electre/ii', body)
    setResult(res.data.result)
    setGraphPayload(body)
  }

  useEffect(() => {
    async function fetchRanking() {
      if (!graphPayload || !graphPayload.performance || graphPayload.performance.length === 0) return
      try {
        const res = await axios.post('/graph/data/ii', graphPayload)
        const ranks = res.data.rankings || []
        setCredibilityMatrix(res.data.credibility || null)
        const data = ranks.map(r => ({ alt: r.alt, avg: r.avg ?? r.value ?? null, asc: r.asc, desc: r.desc }))
        data.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
        setRankingData(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchRanking()
  }, [graphPayload])

  // Função centralizada que altera o tamanho e os valores de forma estritamente síncrona
  const handleParamChange = (p) => {
    const nextCriteria = p.criteria !== undefined ? (parseInt(p.criteria) || 2) : criteria
    const nextAlternatives = p.alternatives !== undefined ? (parseInt(p.alternatives) || 2) : alternatives

    if (p.criteria !== undefined) setCriteria(nextCriteria)
    if (p.alternatives !== undefined) setAlternatives(nextAlternatives)

    if (p.criteria !== undefined || p.alternatives !== undefined) {
      // Redimensiona os pesos imediatamente
      setWeights(prev => {
        const next = Array(nextCriteria).fill('')
        for (let i = 0; i < Math.min(prev.length, nextCriteria); i++) {
          next[i] = prev[i]
        }
        return next
      })

      // Redimensiona a matriz de desempenho imediatamente
      setMatrix(prev => {
        const next = Array.from({ length: nextAlternatives }, () => Array(nextCriteria).fill(''))
        for (let i = 0; i < Math.min(prev.length, nextAlternatives); i++) {
          if (prev[i]) {
            for (let j = 0; j < Math.min(prev[i].length, nextCriteria); j++) {
              next[i][j] = prev[i][j]
            }
          }
        }
        return next
      })
    }

    setEiiParams(prev => ({ ...prev, ...p }))
  }

  return (
    <Box>
      <Typography variant="h5">ELECTRE II</Typography>
      <ParamInputs params={{ criteria, alternatives, ...eiiParams }} onChange={handleParamChange} />
      <Typography>Weights (row 0):</Typography>
      <MatrixEditor rows={1} cols={criteria} value={[weights]} onChange={v => setWeights(v[0])} />
      <Typography>Performance matrix (alternatives x criteria):</Typography>
      <MatrixEditor rows={alternatives} cols={criteria} value={matrix} onChange={setMatrix} />
      <Box sx={{ my: 2 }}>
        <Button variant="contained" onClick={callSolve}>Solve</Button>
      </Box>
      <Typography>Results:</Typography>
      <ResultsTable data={result} />
      <Typography sx={{ mt: 2 }}>Graph:</Typography>
      <div style={{ marginTop: 8 }}>
        <GraphViewCytoscape method={'ii'} payload={graphPayload} />
      </div>
      <Typography sx={{ mt: 2 }}>Ranking (average):</Typography>
      <div style={{ marginTop: 8 }}>
        <BarChart width={600} height={300} data={rankingData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="alt" type="category" />
          <Tooltip />
          <Bar dataKey="avg" fill="#8884d8">
            <LabelList dataKey="avg" position="right" />
          </Bar>
        </BarChart>
      </div>
      <Typography sx={{ mt: 2 }}>Credibility heatmap:</Typography>
      <div style={{ marginTop: 8 }}>
        <Heatmap matrix={credibilityMatrix} />
      </div>
    </Box>
  )
}
