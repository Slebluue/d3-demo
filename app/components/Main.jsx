'use client'
import {useEffect, useState} from 'react'

/** Test Data */
import testData from './aapl.json'

/** D3 */
import * as d3 from 'd3'
import moment from 'moment'


const TEST_MODE = false

const Main = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ 
      ticker: 'AAPL',
      multiplier: '10',
      timespan: 'minute',
      from: '2023-01-09',
      to: '2023-01-09'
   })

  const handleFormData = (key, value) => setForm({...form, [key]: value})

  const fetchData = async ({ ticker, multiplier, timespan, from, to }) => {
    if (TEST_MODE) {
      setData(testData)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_POLYGON_API_KEY}` }
      }).then((res) => res.json())
  
      setData(res)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const drawGraph = () => {
    const margin = {top: 40, right: 40, bottom: 70, left: 40}
    const height = 500 - (margin.top - margin.bottom)
    const width = 1300 - (margin.left - margin.right)

    /** Reset Graph onCall */
    d3.select('#graph').selectAll('*').remove();

    /** Init Graph Size */
    const graph = d3.select('#graph').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(40,40)')

    /** Create xAxis */
    const xScale = d3.scaleBand().range([0,width]).domain(data?.results?.map(d => moment(d.t).format('LT')))
    const xAxis = d3.axisBottom(xScale)
    xAxis.tickFormat((tick, i) => i % 2 === 0 ? '' : tick)
    graph.append('g').call(xAxis)
      .attr('transform', `translate(0, ${height})`)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)')

    /** Create y Axis */
    const max = d3.max(data?.results, (d) => +d.h)
    const min = d3.min(data?.results, (d) => +d.l)
    const yScale = d3.scaleLinear().range([height,0]).domain([min - 1,max + 1])
    graph.append('g').call(d3.axisLeft(yScale))

    /** Create Boxes */
    const boxWidth = width / data?.results.length
    const candles = graph.selectAll('candles').data(data?.results).enter()
    candles.append('rect')
      .attr('x', (_,i) => boxWidth * i)
      .attr('y', (d,_) => d.o > d.c ? yScale(d.o) : yScale(d.c))
        .attr('height', (d) => Math.abs(yScale(d.o) - yScale(d.c)))
        .attr('width', boxWidth - 2)
        .attr('stroke', (d) => d.o > d.c ? 'red' : 'green')
        .style('fill', (d) => d.o > d.c ? 'red' : 'transparent')

    /** Create Line */
    const lines = graph.selectAll('lines').data(data?.results).enter()
    lines.append('line')
      .attr('x1', (_,i) => (boxWidth * i) + (boxWidth / 2) - 1)
      .attr('x2', (_,i) => (boxWidth * i) + (boxWidth / 2) - 1)
      .attr('y1', (d) => yScale(d.l))
      .attr('y2', (d) => yScale(d.h))
        .attr('stroke', (d) => d.o > d.c ? 'red' : 'green')
        .style('width', 20)

    return graph
  }

  useEffect(() => {
    fetchData(form)
  }, [])

  useEffect(() => {
    data && drawGraph()
  }, [data])

  return (
    <div>
      <form>
        <lable>
          Ticker:
          <input type='text' value={form?.ticker} onChange={(e) => handleFormData('ticker', e.target.value)} />
        </lable>
        <lable>
          Multiplier:
          <input type='text' value={form?.multiplier} onChange={(e) => handleFormData('multiplier', e.target.value)} />
        </lable>
        <lable>
          Timespan:
          <input type='text' value={form?.timespan} onChange={(e) => handleFormData('timespan', e.target.value)} />
        </lable>
        <lable>
          From:
          <input type='text' value={form?.from} onChange={(e) => handleFormData('from', e.target.value)} />
        </lable>
        <lable>
          To:
          <input type='text' value={form?.to} onChange={(e) => handleFormData('to', e.target.value)} />
        </lable>
      </form>
      <button onClick={() => fetchData(form)}>Submit</button>
      <div id='graph' style={{ width: '100%', height: '800px' }} />
    </div>
  )
}

export default Main