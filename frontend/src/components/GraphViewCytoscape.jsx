import React, { useEffect, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import { Box, Typography, CircularProgress } from '@mui/material'
import api from '../api'

const stylesheet = [
  {
    selector: 'node',
    style: {
      'background-color': '#2F6F64',
      label: 'data(label)',
      color: '#16201C',
      'font-family': '"IBM Plex Mono", monospace',
      'font-size': 12,
      'text-valign': 'bottom',
      'text-margin-y': 6,
      width: 36,
      height: 36,
      'border-width': 2,
      'border-color': '#1F4D45',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': '#BD8A3F',
      'target-arrow-color': '#BD8A3F',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      label: 'data(label)',
      'font-size': 9,
      color: '#4B5A53',
      'font-family': '"IBM Plex Mono", monospace',
    },
  },
]

export default function GraphViewCytoscape({ method, payload, labelFor }) {
  const [elements, setElements] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!payload || !payload.performance || payload.performance.length === 0) {
        setHasData(false)
        return
      }
      setLoading(true)
      try {
        const res = await api.post(`/graph/data/${method}`, payload)
        const gd = res.data
        const nodes = (gd.nodes || []).map((n) => ({
          data: { id: n.id, label: (labelFor && labelFor(n.id)) || n.label },
          position: n.position,
        }))
        const edges = (gd.edges || []).map((e) => ({
          data: { id: e.id, source: e.source, target: e.target, weight: e.weight, label: e.label },
        }))
        setElements([...nodes, ...edges])
        setHasData(true)
      } catch (err) {
        console.error(err)
        setHasData(false)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [method, JSON.stringify(payload)])

  if (!hasData && !loading) {
    return (
      <Box
        sx={{
          height: 320,
          border: '1px dashed #D8DAD2',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          O grafo de sobreclassificação aparece aqui depois de calcular.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 480, border: '1px solid #D8DAD2', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <CircularProgress size={28} sx={{ color: '#2F6F64' }} />
        </Box>
      )}
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        cy={(cy) => {
          if (!cy) return
          cy.layout({ name: 'circle' }).run()
        }}
      />
    </Box>
  )
}