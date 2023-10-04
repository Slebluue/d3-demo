'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

/** Test Data */
import testData from './aapl.json'

/** Hooks / Utils */
import useRefResize from '../hooks/useRefResize'
import { renderXAxisTick, formatXAxisTick } from '../utils'

/** Styles */
import { Container, Card, Flex, Filter, Title, SubTitle, Button } from '../styles'

/** Dependencies */
import * as d3 from 'd3'
import { Bars } from  'react-loader-spinner'


const TEST_MODE = false // Just for development purposes so I do not rate limit myself.


/**
 * @description
 * Main component. Manages form, data, error, and loading state.
 */
const Main = () => {
  const ref = useRef(null)
  const { width, height } = useRefResize(ref)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ 
      ticker: 'AAPL',
      multiplier: '5',
      timespan: 'minute',
      from: '2023-01-09',
      to: '2023-01-09'
   })

  const handleFormData = (key, value) => setForm({...form, [key]: value})

  /**
   * @description
   * Fetches data from polygon's stock API.
   * Uses the free tier so we are limited to 5 requests per minute
   */
  const fetchData = async ({ ticker, multiplier, timespan, from, to }) => {
    if (TEST_MODE) {
      setData(testData)
      return
    }

    try {
      setError(null)
      setLoading(true)
      const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_POLYGON_API_KEY}` }
      }).then((res) => res.json())

      res?.status !== 'OK'
        ? setError(res?.error || res?.message)
        : setData(res)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  /**
   * @description
   * Function that handles drawing a candle graph in D3.
   * Is responsive based on width/height of card container.
   */
  const drawGraph = useCallback(() => {
    if (!data || !data?.results) return

    const margin = {top: 20, right: 40, bottom: 70, left: 40}
    const graphHeight = height - (margin.top - margin.bottom) - 128
    const graphWidth = width - (margin.left - margin.right) - 64
    const boxWidth = graphWidth / data?.results?.length

    /** Reset Graph onCall */
    d3.select('#graph').selectAll('*').remove();

    /** Init Graph Size */
    const graph = d3.select('#graph').append('svg')
      .attr('width', graphWidth + margin.left + margin.right)
      .attr('height', graphHeight + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    /** Create xAxis */
    const xScale = d3.scaleBand().range([0,graphWidth]).domain(formatXAxisTick(data, form.timespan))
    const xAxis = d3.axisBottom(xScale)
    xAxis.tickFormat((tick, i) => renderXAxisTick(tick, i, boxWidth))
    graph.append('g').call(xAxis)
      .attr('transform', `translate(0, ${graphHeight})`)
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)')

    /** Create y Axis */
    const max = d3.max(data?.results, (d) => +d.h)
    const min = d3.min(data?.results, (d) => +d.l)
    const yScale = d3.scaleLinear().range([graphHeight,0]).domain([min - 1,max + 1])
    graph.append('g').call(d3.axisLeft(yScale))

    /** Create Boxes */
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
  },[data, width, height])

  /**
   * @description
   * Fetch data on mount
   */
  useEffect(() => {
    fetchData(form)
  }, [])

  /**
   * @description
   * Graph redraws when data, width, or height changes for the component.
   */
  useEffect(() => {
    drawGraph()
  }, [drawGraph])

  return (
    <Container>
      <Title>D3 Demo - Candle Graph</Title>
      <SubTitle>Render aggregate bars for a stock given a date range and custom time window sizes.</SubTitle>
      <SubTitle>For example, if timespan = ‘minute’ and multiplier = ‘5’ then 5-minute bars will be returned.</SubTitle>
      <SubTitle>Please note that the (free) API is rate limited to 5 request per minute. You may see an error if you submit the filters within that time frame.</SubTitle>
      <Flex>
        <Filter>
          <span>Ticker:</span>
          <input type='text' value={form?.ticker} onChange={(e) => handleFormData('ticker', e.target.value)} />
        </Filter>
        <Filter>
          <span>Multiplier:</span>
          <input type='text' value={form?.multiplier} onChange={(e) => handleFormData('multiplier', e.target.value)} />
        </Filter>
        <Filter>
          <span>Timespan:</span>
          <input type='text' value={form?.timespan} onChange={(e) => handleFormData('timespan', e.target.value)} />
        </Filter>
        <Filter>
          <span>From:</span>
          <input type='text' value={form?.from} onChange={(e) => handleFormData('from', e.target.value)} />
        </Filter>
        <Filter>
          <span>To:</span>
          <input type='text' value={form?.to} onChange={(e) => handleFormData('to', e.target.value)} />
        </Filter>
        <Button onClick={() => fetchData(form)}>
          {loading
            ? <Bars visible={true} color='white' width='60' height='14' />
            : 'Submit'}
        </Button>
      </Flex>
      {error && <SubTitle style={{ color: 'red' }}>{error}</SubTitle>}
      <Card
        id='graph'
        ref={ref}
        width='100%'
        height='500px'
      />
    </Container>
  )
}

export default Main