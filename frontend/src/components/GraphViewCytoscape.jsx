import React, {useEffect, useState} from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import api from '../api'

export default function GraphViewCytoscape({method, payload}){
  const [elements, setElements] = useState([])

  useEffect(()=>{
    async function fetchData(){
      const res = await api.post(`/graph/data/${method}`, payload)
      // Map GraphData schema to cytoscape elements
      const gd = res.data
      const nodes = (gd.nodes || []).map(n => ({ data: { id: n.id, label: n.label }, position: n.position }))
      const edges = (gd.edges || []).map(e => ({ data: { id: e.id, source: e.source, target: e.target, weight: e.weight, label: e.label } }))
      setElements([...nodes, ...edges])
    }
    fetchData().catch(console.error)
  },[method, JSON.stringify(payload)])

  return (
    <div style={{height:600, border:'1px solid #ddd'}}>
      <CytoscapeComponent elements={elements} style={{width:'100%', height:'100%'}} cy={cy => {
        if(!cy) return
        cy.layout({name: 'circle'}).run()
      }} />
    </div>
  )
}
