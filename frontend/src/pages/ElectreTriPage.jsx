import React, {useState, useEffect} from 'react'
import api from '../api'
import { Button, Box, Typography } from '@mui/material'
import MatrixEditor from '../components/MatrixEditor'
import ParamInputs from '../components/ParamInputs'
import ResultsTable from '../components/ResultsTable'
import GraphViewCytoscape from '../components/GraphViewCytoscape'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts'
import { Slider } from '@mui/material'

export default function ElectreTriPage(){
  const [criteria, setCriteria] = useState(2)
  const [alternatives, setAlternatives] = useState(2)
  const [profiles, setProfiles] = useState(2)
  const [matrix, setMatrix] = useState(Array.from({length:2},()=>Array.from({length:2},()=>'')))
  const [bh, setBh] = useState(Array.from({length:1},()=>Array.from({length:2},()=>'')))
  const [p, setP] = useState(Array.from({length:2},()=>'') )
  const [q, setQ] = useState(Array.from({length:2},()=>'') )
  const [v, setV] = useState(Array.from({length:2},()=>'') )
  const [w, setW] = useState(Array.from({length:2},()=>''))
  const [params, setParams] = useState({electre:7, cut_off:0.5, num_criteria:2, tri_me_evaluators:2})
  const [result, setResult] = useState([])
  const [graphPayload, setGraphPayload] = useState({ x: [], p: [], q: [], v: [], w: [], bh: [] })
  const [scatterData, setScatterData] = useState([])
  const [zoom, setZoom] = useState(1)

  const callSolve = async () => {
    const body = { x: matrix.map(r=>r.map(x=>parseFloat(x||'0'))), p: p.map(x=>parseFloat(x||'0')), q: q.map(x=>parseFloat(x||'0')), v: v.map(x=>parseFloat(x||'0')), w: w.map(x=>parseFloat(x||'0')), bh: bh.map(r=>r.map(x=>parseFloat(x||'0'))), electre: params.electre, cut_off: parseFloat(params.cut_off), num_criteria: params.num_criteria, tri_me_evaluators: params.tri_me_evaluators }
    const res = await axios.post('/electre/tri', body)
    setResult(res.data.result)
    setGraphPayload(body)
  }

  // fetch graph data (positions + rankings) for scatter
  useEffect(()=>{
    async function fetchGraph(){
      if(!graphPayload || !graphPayload.x || graphPayload.x.length === 0) return
      try{
        const res = await api.post('/graph/data/tri', graphPayload)
        const gd = res.data
        const nodes = gd.nodes || []
        // nodes may include position {x,y}
        const data = nodes.map(n => ({ alt: n.id, x: n.position ? parseFloat(n.position.x) : 0, y: n.position ? parseFloat(n.position.y) : 0 }))
        setScatterData(data)
      }catch(err){
        console.error(err)
      }
    }
    fetchGraph()
  },[graphPayload])

  return (
    <Box>
      <Typography variant="h5">ELECTRE Tri / Tri-ME</Typography>
      <ParamInputs params={{criteria, alternatives, profiles, ...params}} onChange={p2 => { if(p2.criteria) setCriteria(parseInt(p2.criteria)); if(p2.alternatives) setAlternatives(parseInt(p2.alternatives)); if(p2.profiles) setProfiles(parseInt(p2.profiles)); setParams({...params, ...p2}) }} />
      <Typography>Profile matrix (bh) — first profiles-1 rows:</Typography>
      <MatrixEditor rows={profiles - 1 || 1} cols={criteria} value={bh} onChange={setBh} />
      <Typography>Top parameter rows: q,p,v,w (use the previous section if needed)</Typography>
      <Typography>Performance matrix (alternatives x criteria):</Typography>
      <MatrixEditor rows={alternatives} cols={criteria} value={matrix} onChange={setMatrix} />
      <Box sx={{my:2}}>
        <Button variant="contained" onClick={callSolve}>Solve</Button>
      </Box>
      <Typography>Results:</Typography>
      <ResultsTable data={result} />
      <Typography sx={{mt:2}}>Graph (Cytoscape):</Typography>
      <div style={{marginTop:8}}>
        <GraphViewCytoscape method={'tri'} payload={graphPayload} />
      </div>
      <Typography sx={{mt:2}}>Projection (scatter):</Typography>
      <div style={{display:'flex', alignItems:'center', gap:16}}>
        <div style={{flex:1, height:360}}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis dataKey="x" name="X" type="number" allowDecimals={true} />
              <YAxis dataKey="y" name="Y" type="number" allowDecimals={true} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => [value, name]} />
              <Scatter name="alternatives" data={scatterData.map(d=>({...d, x: d.x*zoom, y: d.y*zoom}))} fill="#8884d8">
                <LabelList dataKey="alt" position="right" />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div style={{width:200}}>
          <Typography>Zoom</Typography>
          <Slider min={0.5} max={3} step={0.1} value={zoom} onChange={(e,v)=>setZoom(v)} />
        </div>
      </div>
    </Box>
  )
}
