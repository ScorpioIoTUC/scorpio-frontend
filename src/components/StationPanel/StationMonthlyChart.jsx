const CHART_COLORS = [
  '#22d3ee',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#e11d48',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#a3e635',
  '#f472b6',
]

function getDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function getRecentDays(daysCount) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  return Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - (daysCount - index - 1))
    return getDateKey(date)
  })
}

function getSatelliteKey(entry) {
  return entry.satelliteDisplayName || `NORAD ${entry.satelliteNoradId || 'unknown'}`
}

function buildChartModel(entries, daysCount) {
  const days = getRecentDays(daysCount)
  const satelliteMap = new Map()
  const countByDay = new Map()

  entries.forEach((entry) => {
    const date = String(entry.date || '').slice(0, 10)
    const count = Number(entry.count) || 0
    const satelliteName = getSatelliteKey(entry)

    if (!date || count <= 0) return

    if (!satelliteMap.has(satelliteName)) {
      satelliteMap.set(satelliteName, {
        key: satelliteName,
        name: satelliteName,
        color: CHART_COLORS[satelliteMap.size % CHART_COLORS.length],
      })
    }

    const dayCounts = countByDay.get(date) || new Map()
    dayCounts.set(satelliteName, (dayCounts.get(satelliteName) || 0) + count)
    countByDay.set(date, dayCounts)
  })

  const satellites = Array.from(satelliteMap.values())
  const dailyTotals = days.map((date) => {
    const dayCounts = countByDay.get(date)
    if (!dayCounts) return 0

    return Array.from(dayCounts.values()).reduce((total, count) => total + count, 0)
  })

  return {
    days,
    satellites,
    countByDay,
    maxTotal: Math.max(1, ...dailyTotals),
    totalPackets: dailyTotals.reduce((total, count) => total + count, 0),
  }
}

export default function StationMonthlyChart({ stats, isLoading, error }) {
  if (isLoading) {
    return <p className="station-panel__state">Loading statistics...</p>
  }

  if (error) {
    return <p className="station-panel__state station-panel__state--error">{error}</p>
  }

  const entries = Array.isArray(stats?.data) ? stats.data : []

  if (!entries.length) {
    return <p className="station-panel__state">No packet statistics available for this station.</p>
  }

  const daysCount = Math.max(1, Number(stats?.days) || 30)
  const { days, satellites, countByDay, maxTotal, totalPackets } = buildChartModel(entries, daysCount)
  const width = 380
  const height = 240
  const margin = { top: 18, right: 16, bottom: 38, left: 42 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const columnStep = plotWidth / days.length
  const barWidth = Math.max(5, columnStep - 3)
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="station-chart">
      <div className="station-chart__summary">
        <span>Packets in the last {daysCount} days</span>
        <strong>{totalPackets.toLocaleString()}</strong>
      </div>

      <div className="station-chart__canvas" role="img" aria-label={`Packets received in the last ${daysCount} days`}>
        <svg viewBox={`0 0 ${width} ${height}`} focusable="false">
          {gridLines.map((line) => {
            const y = margin.top + plotHeight - line * plotHeight
            const value = Math.round(maxTotal * line)

            return (
              <g key={line}>
                <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} className="station-chart__grid" />
                <text x={margin.left - 8} y={y + 4} className="station-chart__axis-label" textAnchor="end">
                  {value}
                </text>
              </g>
            )
          })}

          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            className="station-chart__axis"
          />
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={height - margin.bottom}
            y2={height - margin.bottom}
            className="station-chart__axis"
          />

          {days.map((date, dayIndex) => {
            const x = margin.left + dayIndex * columnStep + (columnStep - barWidth) / 2
            const dayCounts = countByDay.get(date)
            let stackedHeight = 0

            return (
              <g key={date}>
                {satellites.map((satellite) => {
                  const count = dayCounts?.get(satellite.key) || 0
                  if (!count) return null

                  const rectHeight = (count / maxTotal) * plotHeight
                  const y = margin.top + plotHeight - stackedHeight - rectHeight
                  stackedHeight += rectHeight

                  return (
                    <rect
                      key={satellite.key}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(1, rectHeight)}
                      fill={satellite.color}
                      rx="2"
                    >
                      <title>
                        {satellite.name}: {count} packets on {date}
                      </title>
                    </rect>
                  )
                })}

                {(dayIndex % 3 === 0 || dayIndex === days.length - 1) && (
                  <text
                    x={x + barWidth / 2}
                    y={height - margin.bottom + 18}
                    className="station-chart__axis-label"
                    textAnchor="middle"
                  >
                    {Number(date.slice(-2))}
                  </text>
                )}
              </g>
            )
          })}

          <text
            x={margin.left + plotWidth / 2}
            y={height - 6}
            className="station-chart__caption"
            textAnchor="middle"
          >
            Day of month
          </text>
        </svg>
      </div>

      <div className="station-chart__legend" aria-label="Satellites">
        {satellites.map((satellite) => (
          <span key={satellite.key}>
            <i style={{ backgroundColor: satellite.color }} />
            {satellite.name}
          </span>
        ))}
      </div>
    </div>
  )
}
