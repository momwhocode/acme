import { useState } from "react"
import { formatCount, formatPct, pctShare } from "../../lib/homeOverview"

function polar(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180
  return [ cx + radius * Math.cos(radians), cy + radius * Math.sin(radians) ]
}

function fullRing(cx, cy, outer, inner) {
  return [
    `M ${cx} ${cy - outer}`,
    `A ${outer} ${outer} 0 1 1 ${cx} ${cy + outer}`,
    `A ${outer} ${outer} 0 1 1 ${cx} ${cy - outer}`,
    `M ${cx} ${cy - inner}`,
    `A ${inner} ${inner} 0 1 0 ${cx} ${cy + inner}`,
    `A ${inner} ${inner} 0 1 0 ${cx} ${cy - inner}`
  ].join(" ")
}

function donutSlicePath(cx, cy, outer, inner, start, end) {
  const sweep = ((end - start) + 360) % 360
  if (sweep < 0.2 || sweep > 359.8) return fullRing(cx, cy, outer, inner)

  const large = sweep > 180 ? 1 : 0
  const [ x1, y1 ] = polar(cx, cy, outer, start)
  const [ x2, y2 ] = polar(cx, cy, outer, end)
  const [ x3, y3 ] = polar(cx, cy, inner, end)
  const [ x4, y4 ] = polar(cx, cy, inner, start)
  return `M ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`
}

/** SVG employment-type donut so each slice can show a hover tooltip. */
export function OverviewDonut({ slices, total }) {
  const [ tip, setTip ] = useState("")
  let cursor = 0
  const sectors = slices.map((slice) => {
    const share = pctShare(slice.headcount, total)
    const start = (cursor / 100) * 360
    cursor += share
    return { ...slice, start, end: (cursor / 100) * 360, share }
  })

  return (
    <div className="acme-overview__donut">
        <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Employment Type">
        {sectors.map((slice) => (
          <path
            key={slice.key}
            className="acme-overview__donut-slice"
            d={donutSlicePath(80, 80, 80, 48, slice.start, slice.end)}
            fill={slice.color}
            fillRule="evenodd"
            onMouseEnter={() => setTip(`${slice.label} · ${formatCount(slice.headcount)} · ${formatPct(slice.share)}`)}
            onMouseLeave={() => setTip("")}
          />
        ))}
      </svg>
      <div className="acme-overview__donut-hole">
        <strong>{formatCount(total)}</strong>
        <span>people</span>
      </div>
      {tip ? <span className="acme-overview__chart-tip" role="tooltip">{tip}</span> : null}
    </div>
  )
}
