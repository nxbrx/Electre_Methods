import React from 'react'
import { Box, Typography, Card, CardContent, Divider } from '@mui/material'
import Step from '../components/StepRail'
import { dataFont } from '../theme'

function OutrankingDiagram() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <svg width="420" height="180" viewBox="0 0 420 180">
        <circle cx="80" cy="90" r="34" fill="#FFFFFF" stroke="#2F6F64" strokeWidth="2.5" />
        <text x="80" y="95" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="16" fill="#16201C">A</text>

        <circle cx="340" cy="40" r="30" fill="#FFFFFF" stroke="#2F6F64" strokeWidth="2.5" />
        <text x="340" y="45" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="15" fill="#16201C">B</text>

        <circle cx="340" cy="140" r="30" fill="#FFFFFF" stroke="#BD8A3F" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x="340" y="145" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="15" fill="#16201C">C</text>

        <defs>
          <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2F6F64" />
          </marker>
          <marker id="arrowBrass" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#BD8A3F" />
          </marker>
        </defs>

        <line x1="108" y1="78" x2="308" y2="48" stroke="#2F6F64" strokeWidth="2" markerEnd="url(#arrowTeal)" />
        <line x1="108" y1="102" x2="308" y2="132" stroke="#BD8A3F" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arrowBrass)" />
      </svg>
    </Box>
  )
}

function Legend() {
  return (
    <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 22, height: 2, backgroundColor: '#2F6F64' }} />
        <Typography variant="caption" color="text.secondary">A sobreclassifica fortemente B</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 22, height: 0, borderTop: '2px dashed #BD8A3F' }} />
        <Typography variant="caption" color="text.secondary">A sobreclassifica fracamente C</Typography>
      </Box>
    </Box>
  )
}

export default function AboutPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 820 }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, mb: 1 }}>
          Sobre o método ELECTRE II
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Como o método funciona e como usar esta calculadora.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>O que é ELECTRE?</Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            ELECTRE é uma família de métodos de apoio à decisão multicritério criada na França nos
            anos 1960, voltada a problemas em que várias alternativas precisam ser comparadas sob
            vários critérios, muitas vezes conflitantes — por exemplo, custo, prazo e qualidade.
          </Typography>
          <Typography variant="body2">
            Em vez de somar notas ponderadas, os métodos ELECTRE constroem <strong>relações de
            sobreclassificação</strong>: para cada par de alternativas, eles testam se há
            evidência suficiente para afirmar que uma é "pelo menos tão boa quanto" a outra.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Como o ELECTRE II decide</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para cada par de alternativas A e B, o método combina dois testes:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontFamily: dataFont }}>
                Concordância
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Soma o peso dos critérios em que A é pelo menos tão boa quanto B. Quanto maior essa
                soma, mais forte é a evidência a favor de A.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'secondary.dark', fontFamily: dataFont }}>
                Discordância
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verifica se existe algum critério isolado em que B é tão melhor que A que isso
                derruba a sobreclassificação, mesmo com boa concordância.
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Combinando esses dois testes em diferentes limites (<em>c⁺, c, c⁻</em> para
            concordância e <em>d1, d2</em> para discordância), o método classifica cada par como
            relação <strong>forte</strong> ou <strong>fraca</strong> de sobreclassificação:
          </Typography>

          <OutrankingDiagram />
          <Legend />

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2">
            A partir dessas relações, o ELECTRE II monta dois pré-ordenamentos completos das
            alternativas — um do melhor para o pior, outro do pior para o melhor — e combina os
            dois num <strong>ranking final único</strong>, mais estável do que olhar apenas um
            sentido de comparação.
          </Typography>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Como usar esta calculadora</Typography>

        <Step number="01" title="Defina o problema">
          <Typography variant="body2" color="text.secondary">
            Informe quantos critérios e alternativas você vai comparar, e ajuste os parâmetros do
            método (limites de concordância e discordância) — ou mantenha os valores padrão.
          </Typography>
        </Step>

        <Step number="02" title="Atribua os pesos">
          <Typography variant="body2" color="text.secondary">
            Defina o peso de cada critério. Critérios mais importantes para a decisão devem
            receber pesos maiores.
          </Typography>
        </Step>

        <Step number="03" title="Preencha o desempenho">
          <Typography variant="body2" color="text.secondary">
            Na matriz de desempenho, informe o valor de cada alternativa em cada critério — por
            exemplo, o custo de cada opção, ou a nota recebida em cada quesito.
          </Typography>
        </Step>

        <Step number="04" title="Calcule e explore o resultado" last>
          <Typography variant="body2" color="text.secondary">
            Clique em "Calcular" e use as abas de resultado para ver o ranking final, o grafo de
            sobreclassificação, a tabela detalhada e o mapa de credibilidade entre as alternativas.
          </Typography>
        </Step>
      </Box>
    </Box>
  )
}
