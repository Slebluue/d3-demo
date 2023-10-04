import moment from 'moment'

const renderXAxisTick = (tick, i, size) => {
  if (size > 10) {
    return tick
  }
  
  if (size <= 5 && size >= 3) {
    return i !== 0 && i % 3 !== 0 ? '' : tick
  }

  if (size < 3) {
    return i !== 0 && i % 6 !== 0 ? '' : tick
  }

  if (size < 2.5) {
    return i !== 0 && i % 12 !== 0 ? '' : tick
  }


  return i % 2 === 0 ? '' : tick
}

const FORMAT_MAP = {
  second: 'LT',
  minute: 'LT',
  hour: 'LT',
  day: 'L',
  week: 'L',
  month: 'L',
  quarter: 'L',
  year: 'YYYY',
}
const formatXAxisTick = (data, timeframe) => {
  return data?.results?.map(d => moment(d.t).format(FORMAT_MAP[timeframe]))
}

export { renderXAxisTick, formatXAxisTick }