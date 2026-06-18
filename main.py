from __future__ import annotations

from typing import List

from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from api_models import (
    ElectreIRequest,
    ElectreISRequest,
    ElectreIVLikeRequest,
    ElectreIVRequest,
    ElectreTriRequest,
    ElectreResponse,
    GraphData,
)

import numpy as np

from matrix_electre import (
    ELECTRE_I,
    ELECTRE_I_s,
    ELECTRE_I_v,
    ELECTRE_II,
    ELECTRE_III,
    ELECTRE_IV,
    ELECTRE_Tri,
    MatrixOperations,
    Concordance,
    Discordance,
    Credibility,
    Ranking,
)


app = FastAPI(title="J-ELECTRE API", version="0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O asterisco permite que o localhost e a Vercel acessem
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (POST, GET, OPTIONS)
    allow_headers=["*"],
)

def to_numpy_matrix(m: List[List[float]]) -> np.ndarray:
    try:
        return np.array(m, dtype=float)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid matrix data: {e}")


@app.post("/electre/i", response_model=ElectreResponse)
def electre_i(req: ElectreIRequest):
    arr = to_numpy_matrix(req.performance)
    w = np.array(req.weights, dtype=float)
    out = ELECTRE_I.e_I_Algorithm(arr, w, req.ei_p, req.ei_q)
    return ElectreResponse(result=out.tolist())


@app.post("/electre/i_s", response_model=ElectreResponse)
def electre_i_s(req: ElectreISRequest):
    arr = to_numpy_matrix(req.performance)
    w = np.array(req.weights, dtype=float)
    p = np.array(req.p, dtype=float)
    q = np.array(req.q, dtype=float)
    v = np.array(req.v, dtype=float)
    out = ELECTRE_I_s.e_I_s_Algorithm(arr, w, p, q, v, req.ei_s_lambda, req.maximum_cycles)
    return ElectreResponse(result=out.tolist())


@app.post("/electre/i_v", response_model=ElectreResponse)
def electre_i_v(req: ElectreIVLikeRequest):
    if req.weights is None or req.v is None:
        raise HTTPException(status_code=400, detail="weights and v are required for ELECTRE I_v")
    arr = to_numpy_matrix(req.performance)
    w = np.array(req.weights, dtype=float)
    v = np.array(req.v, dtype=float)
    # ei_v_p and ei_v_q expected in eii-like request as eii_cp/eii_c for convenience
    p = req.eii_cp or 0.0
    q = req.eii_c or 0.0
    out = ELECTRE_I_v.e_I_v_Algorithm(arr, v, w, p, q)
    return ElectreResponse(result=out.tolist())


@app.post("/electre/ii", response_model=ElectreResponse)
def electre_ii(req: ElectreIVLikeRequest):
    if req.weights is None or req.eii_cp is None:
        raise HTTPException(status_code=400, detail="weights and eii parameters required for ELECTRE II")
    arr = to_numpy_matrix(req.performance)
    w = np.array(req.weights, dtype=float)
    out = ELECTRE_II.rankFinal(
        arr,
        w,
        req.eii_cp,
        req.eii_c or 0.0,
        req.eii_cm or 0.0,
        req.eii_d1 or 0.0,
        req.eii_d2 or 0.0,
        req.maximum_cycles,
    )
    return ElectreResponse(result=out.tolist())


@app.post("/electre/iii", response_model=ElectreResponse)
def electre_iii(req: ElectreIVLikeRequest):
    if req.weights is None or req.p is None or req.q is None or req.v is None:
        raise HTTPException(status_code=400, detail="weights, p, q, v required for ELECTRE III")
    arr = to_numpy_matrix(req.performance)
    w = np.array(req.weights, dtype=float)
    p = np.array(req.p, dtype=float)
    q = np.array(req.q, dtype=float)
    v = np.array(req.v, dtype=float)
    out = ELECTRE_III.rankFinal(arr, w, p, q, v)
    return ElectreResponse(result=out.tolist())


@app.post("/electre/iv", response_model=ElectreResponse)
def electre_iv(req: ElectreIVRequest):
    arr = to_numpy_matrix(req.performance)
    p = np.array(req.p, dtype=float)
    q = np.array(req.q, dtype=float)
    v = np.array(req.v, dtype=float)
    out = ELECTRE_IV.rankFinal(arr, p, q, v)
    return ElectreResponse(result=out.tolist())


@app.post("/electre/tri", response_model=ElectreResponse)
def electre_tri(req: ElectreTriRequest):
    x = to_numpy_matrix(req.x)
    p = np.array(req.p, dtype=float)
    q = np.array(req.q, dtype=float)
    v = np.array(req.v, dtype=float)
    w = np.array(req.w, dtype=float)
    bh = to_numpy_matrix(req.bh)
    out = ELECTRE_Tri.e_Tri_Algorithm(
        x,
        p,
        q,
        v,
        w,
        bh,
        req.electre,
        req.cut_off,
        req.num_criteria,
        req.tri_me_evaluators,
    )
    return ElectreResponse(result=out.tolist())


@app.post("/graph/data/{method}", response_model=GraphData)
def graph_data(method: str, body: dict):
    """Return structured graph data (nodes, edges, kernel, xy) for the given method.
    method: one of 'ei','ei_s','ei_v','ii','iii','iv','tri'
    body: the same payload used to call the algorithm (performance, weights, etc.)
    """
    # Minimal implementation: call the same algorithm endpoints and try to extract nodes/edges/kernel/xy when available
    def _empty(method_name: str):
        return {
            'method': method_name,
            'nodes': [],
            'edges': [],
            'dominance': None,
            'concordance': None,
            'discordance': None,
            'credibility': None,
            'rankings': None,
            'metadata': {},
        }

    try:
        if method == 'ei':
            req = body
            arr = np.array(req.get('performance', []), dtype=float)
            # require a 2D performance matrix
            if arr.size == 0 or arr.ndim != 2:
                return _empty('ei')
            w = np.array(req.get('weights', np.ones(arr.shape[1])), dtype=float)
            # compute numeric matrices explicitly
            ei_p = float(req.get('ei_p', 0.0))
            ei_q = float(req.get('ei_q', 0.0))
            concordance = Concordance.getConcordanceMatrixEI(arr, w)
            discordance = Discordance.getDiscordanceMatrixEI(arr)
            credibility = Credibility.getCredibilityMatrixEI(arr, w, ei_p, ei_q)
            # nodes and edges: use credibility==1 as directed dominance
            nodes = [{'id': f'a{i+1}', 'label': f'a{i+1}'} for i in range(arr.shape[0])]
            edges = []
            for i in range(credibility.shape[0]):
                for j in range(credibility.shape[1]):
                    if credibility[i, j] == 1.0:
                        edges.append({'id': f'e{i}_{j}', 'source': f'a{i+1}', 'target': f'a{j+1}', 'weight': float(credibility[i, j])})
            rankings = [{'alt': n['id'], 'rank': None} for n in nodes]
            return {
                'method': 'ei',
                'nodes': nodes,
                'edges': edges,
                'dominance': None,
                'concordance': concordance.tolist(),
                'discordance': discordance.tolist(),
                'credibility': credibility.tolist(),
                'rankings': rankings,
                'metadata': {},
            }
        elif method == 'ei_s':
            # For EI_s we'll return nodes/edges and cycles info
            req = body
            arr = np.array(req.get('performance', []), dtype=float)
            if arr.size == 0 or arr.ndim != 2:
                return _empty('ei_s')
            w = np.array(req.get('weights', np.ones(arr.shape[1])), dtype=float)
            p = np.array(req.get('p', [0]*arr.shape[1]), dtype=float)
            q = np.array(req.get('q', [0]*arr.shape[1]), dtype=float)
            v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
            # compute numeric concordance/discordance/credibility
            cmat = Concordance.getConcordanceMatrixEI_s(arr, w, p, q)
            dmat = Discordance.getDiscordanceMatrixEI_s(float(req.get('ei_s_lambda', 0.5)), arr, w, p, q, v, 0, float(req.get('ei_s_lambda', 0.5)))
            cred = Credibility.getCredibilityMatrixEI_s(arr, w, p, q, v, float(req.get('ei_s_lambda', 0.5)))
            nodes = [{'id': f'a{i+1}', 'label': f'a{i+1}'} for i in range(arr.shape[0])]
            edges = []
            for i in range(cred.shape[0]):
                for j in range(cred.shape[1]):
                    if cred[i, j] == 1.0:
                        edges.append({'id': f'e{i}_{j}', 'source': f'a{i+1}', 'target': f'a{j+1}', 'weight': float(cred[i, j])})
            return {
                'method': 'ei_s',
                'nodes': nodes,
                'edges': edges,
                'dominance': None,
                'concordance': cmat.tolist(),
                'discordance': dmat.tolist() if isinstance(dmat, np.ndarray) else None,
                'credibility': cred.tolist(),
                'rankings': None,
                'metadata': {},
            }
        elif method == 'ei_v':
            # Similar extraction using ELECTRE_I_v
            req = body
            arr = np.array(req.get('performance', []), dtype=float)
            if arr.size == 0 or arr.ndim != 2:
                return _empty('ei_v')
            w = np.array(req.get('weights', np.ones(arr.shape[1])), dtype=float)
            v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
            # compute numeric concordance/discordance/credibility for EI_v
            cmat = Concordance.getConcordanceMatrixEI_v(arr, w)
            dmat = Discordance.getDiscordanceMatrixEI_v(arr, v)
            cred = Credibility.getCredibilityMatrixEI_v(arr, v, w, float(req.get('eii_cp', 0.0)), float(req.get('eii_c', 0.0)))
            nodes = [{'id': f'a{i+1}', 'label': f'a{i+1}'} for i in range(arr.shape[0])]
            edges = []
            for i in range(cred.shape[0]):
                for j in range(cred.shape[1]):
                    if cred[i, j] == 1.0:
                        edges.append({'id': f'e{i}_{j}', 'source': f'a{i+1}', 'target': f'a{j+1}', 'weight': float(cred[i, j])})
            return {
                'method': 'ei_v',
                'nodes': nodes,
                'edges': edges,
                'dominance': None,
                'concordance': cmat.tolist(),
                'discordance': dmat.tolist(),
                'credibility': cred.tolist(),
                'rankings': None,
                'metadata': {},
            }
        elif method in ('ii','iii','iv'):
            # Use common pattern: call the ranking functions and parse dominance matrix from returned block
            req = body
            arr = np.array(req.get('performance', []), dtype=float)
            if arr.size == 0 or arr.ndim != 2:
                return _empty(method)
            nodes = [{'data':{'id':f'a{i+1}','label':f'a{i+1}'}} for i in range(arr.shape[0])]
            edges = []
            dominance = None
            # call corresponding algorithm
            if method == 'ii':
                w = np.array(req['weights'], dtype=float)
                out = ELECTRE_II.rankFinal(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15)))
            elif method == 'iii':
                w = np.array(req['weights'], dtype=float)
                p = np.array(req.get('p', [0]*arr.shape[1]), dtype=float)
                q = np.array(req.get('q', [0]*arr.shape[1]), dtype=float)
                v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
                out = ELECTRE_III.rankFinal(arr, w, p, q, v)
            else:
                p = np.array(req.get('p', [0]*arr.shape[1]), dtype=float)
                q = np.array(req.get('q', [0]*arr.shape[1]), dtype=float)
                v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
                out = ELECTRE_IV.rankFinal(arr, p, q, v)
            # compute numeric concordance/discordance/credibility and rankings
            if method == 'ii':
                w = np.array(req['weights'], dtype=float)
                concord = Concordance.getConcordanceMatrixEII(arr, w)
                discord = Discordance.getDiscordanceMatrixEII(arr)
                cred = Credibility.getCredibilityMatrixEII(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)))
                # rankings using ascending/descending routines
                asc = ELECTRE_II.rankAscending(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15)))
                desc = ELECTRE_II.rankDescending(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15)))
                ra = MatrixOperations.getColumnSum(asc)
                rd = MatrixOperations.getColumnSum(desc)
                rm = (ra + rd) / 2.0
                rankings = []
                for i in range(arr.shape[0]):
                    rankings.append({'alt': f'a{i+1}', 'asc': float(ra[i]), 'desc': float(rd[i]), 'avg': float(rm[i])})
            elif method == 'iii':
                w = np.array(req['weights'], dtype=float)
                p = np.array(req.get('p', [0]*arr.shape[1]), dtype=float)
                q = np.array(req.get('q', [0]*arr.shape[1]), dtype=float)
                v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
                concord = Concordance.getConcordanceMatrixEIII(arr, w, p, q)
                discord = Discordance.getDiscordanceMatrixEIII(arr)
                cred = Credibility.getCredibilityMatrixEIII(arr, w, p, q, v)
                asc = ELECTRE_III.rankAscending(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15))) if hasattr(ELECTRE_III, 'rankAscending') else np.zeros((arr.shape[0], arr.shape[0]))
                desc = ELECTRE_III.rankDescending(arr, w, float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15))) if hasattr(ELECTRE_III, 'rankDescending') else np.zeros((arr.shape[0], arr.shape[0]))
                ra = MatrixOperations.getColumnSum(asc)
                rd = MatrixOperations.getColumnSum(desc)
                rm = (ra + rd) / 2.0
                rankings = [{'alt': f'a{i+1}', 'asc': float(ra[i]), 'desc': float(rd[i]), 'avg': float(rm[i])} for i in range(arr.shape[0])]
            else:
                p = np.array(req.get('p', [0]*arr.shape[1]), dtype=float)
                q = np.array(req.get('q', [0]*arr.shape[1]), dtype=float)
                v = np.array(req.get('v', [0]*arr.shape[1]), dtype=float)
                concord = Concordance.getConcordanceMatrixEIII(arr, np.ones(arr.shape[1]), p, q) if hasattr(Concordance, 'getConcordanceMatrixEIII') else None
                discord = Discordance.getDiscordanceMatrixEIV(arr) if hasattr(Discordance, 'getDiscordanceMatrixEIV') else None
                cred = Credibility.getCredibilityMatrixEIV(arr, p, q, v)
                asc = ELECTRE_IV.rankAscending(arr, np.ones(arr.shape[1]), float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15))) if hasattr(ELECTRE_IV, 'rankAscending') else np.zeros((arr.shape[0], arr.shape[0]))
                desc = ELECTRE_IV.rankDescending(arr, np.ones(arr.shape[1]), float(req.get('eii_cp', 0.5)), float(req.get('eii_c', 0.5)), float(req.get('eii_cm', 0.5)), float(req.get('eii_d1', 0.0)), float(req.get('eii_d2', 0.0)), int(req.get('maximum_cycles', 15))) if hasattr(ELECTRE_IV, 'rankDescending') else np.zeros((arr.shape[0], arr.shape[0]))
                ra = MatrixOperations.getColumnSum(asc)
                rd = MatrixOperations.getColumnSum(desc)
                rm = (ra + rd) / 2.0
                rankings = [{'alt': f'a{i+1}', 'asc': float(ra[i]), 'desc': float(rd[i]), 'avg': float(rm[i])} for i in range(arr.shape[0])]
            # build nodes/edges from credibility (where available) else fall back to dominance
            nodes_out = [{'id': f'a{i+1}', 'label': f'a{i+1}'} for i in range(arr.shape[0])]
            edges_out = []
            if 'cred' in locals() and isinstance(cred, np.ndarray):
                for i in range(cred.shape[0]):
                    for j in range(cred.shape[1]):
                        if cred[i, j] != 0.0:
                            edges_out.append({'id': f'e{i}_{j}', 'source': f'a{i+1}', 'target': f'a{j+1}', 'weight': float(cred[i, j])})
            elif dominance is not None:
                for i in range(len(dominance)):
                    for j in range(len(dominance)):
                        if dominance[i][j] != 0:
                            edges_out.append({'id': f'e{i}_{j}', 'source': f'a{i+1}', 'target': f'a{j+1}', 'label': str(dominance[i][j])})
            return {
                'method': method,
                'nodes': nodes_out,
                'edges': edges_out,
                'dominance': dominance.tolist() if dominance is not None else None,
                'concordance': concord.tolist() if 'concord' in locals() and concord is not None else None,
                'discordance': discord.tolist() if 'discord' in locals() and discord is not None else None,
                'credibility': cred.tolist() if 'cred' in locals() and isinstance(cred, np.ndarray) else None,
                'rankings': rankings,
                'metadata': {},
            }
        elif method == 'tri':
            req = body
            x = np.array(req['x'], dtype=float)
            p = np.array(req.get('p', [0]*x.shape[1]), dtype=float)
            q = np.array(req.get('q', [0]*x.shape[1]), dtype=float)
            v = np.array(req.get('v', [0]*x.shape[1]), dtype=float)
            w = np.array(req.get('w', [0]*x.shape[1]), dtype=float)
            bh = np.array(req.get('bh', [[0]*x.shape[1]]), dtype=float)
            out = ELECTRE_Tri.e_Tri_Algorithm(x, p, q, v, w, bh, int(req.get('electre',7)), float(req.get('cut_off',0.5)), int(req.get('num_criteria', x.shape[1])), int(req.get('tri_me_evaluators',2)))
            out_a = np.array(out, dtype=object)
            # classification block search
            nodes = []
            edges = []
            classes = []
            for i in range(out_a.shape[0]):
                if str(out_a[i,0]).strip() == 'Classification:':
                    for m in range(x.shape[0]):
                        alt = out_a[i+1+m,2]
                        pess = out_a[i+1+m,3]
                        opt = out_a[i+1+m,4]
                        nodes.append({'data':{'id':f'a{m+1}','label':f'a{m+1}'} , 'position': {'x': float(x[m,0]) if x.shape[1]>=1 else 0, 'y': float(x[m,1]) if x.shape[1]>=2 else 0 } })
                        classes.append({'alt': f'a{m+1}', 'pess': pess, 'opt': opt})
                    break
            return {
                'method': 'tri',
                'nodes': [{'id': n['data']['id'], 'label': n['data'].get('label'), 'position': n.get('position')} for n in nodes],
                'edges': [{'id': e['data']['id'], 'source': e['data']['source'], 'target': e['data']['target']} for e in edges],
                'dominance': None,
                'concordance': None,
                'discordance': None,
                'credibility': None,
                'rankings': classes,
                'metadata': {},
            }
        else:
            raise HTTPException(status_code=400, detail='graph_data for this method not implemented yet')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
