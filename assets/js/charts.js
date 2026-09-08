/**
 * charts.js — inline SVG, no dependencies.
 *
 * Two forms only:
 *   processBars()  magnitude of the six processes — one hue per entity,
 *                  grouped when a second entity is present
 *   corpusMap()    a 2-D projection of the whole set — identity by colour,
 *                  with the corpus itself as recessive context
 *
 * Colour roles come from the stylesheet (--series-1/2, --grid, --text-*).
 * The categorical slots are validated for the dark surface on all pairs.
 * Every chart ships a hover layer and is paired with a table view in ui.js.
 */

import { PROCESS_ORDER, PROCESSES } from "./content.js";

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs, text) {
  const node = document.createElementNS(NS, name);
  Object.keys(attrs || {}).forEach(k => node.setAttribute(k, attrs[k]));
  if (text != null) node.textContent = text;
  return node;
}

/* ---- shared hover layer ---- */
let tip;
function tooltip() {
  if (tip) return tip;
  tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.setAttribute("role", "status");
  Object.assign(tip.style, {
    position: "fixed", pointerEvents: "none", opacity: "0",
    background: "#1e2836", color: "#eef2f6", border: "1px solid #26323f",
    borderRadius: "6px", padding: "0.45rem 0.6rem", fontSize: "0.8rem",
    lineHeight: "1.35", zIndex: "80", maxWidth: "16rem",
    transition: "opacity 0.12s", boxShadow: "0 10px 26px rgba(0,0,0,0.45)"
  });
  document.body.appendChild(tip);
  return tip;
}

function bindTip(node, html) {
  const show = ev => {
    const t = tooltip();
    t.innerHTML = html;
    t.style.opacity = "1";
    const pt = ev.touches ? ev.touches[0] : ev;
    const w = t.offsetWidth, h = t.offsetHeight;
    t.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, pt.clientX + 12)) + "px";
    t.style.top = Math.max(8, pt.clientY - h - 12) + "px";
  };
  const hide = () => { if (tip) tip.style.opacity = "0"; };
  node.addEventListener("mouseenter", show);
  node.addEventListener("mousemove", show);
  node.addEventListener("mouseleave", hide);
  node.addEventListener("touchstart", show, { passive: true });
  node.addEventListener("touchend", hide);
}

/**
 * Horizontal bars: the six process intensities, 0–100.
 * series: [{ key, label, colorVar, vector }] — one or two entries.
 */
export function processBars(series) {
  const rowH = 34, gap = 10, padL = 168, padR = 44, padT = 8;
  const groups = series.length;
  const barH = groups > 1 ? 11 : 15;
  const height = padT + PROCESS_ORDER.length * (rowH + gap);
  const width = 640;
  const plotW = width - padL - padR;

  const svg = el("svg", {
    class: "chart", viewBox: "0 0 " + width + " " + height,
    role: "img", "aria-label": "Process intensity, nought to one hundred, for " + series.map(s => s.label).join(" and ")
  });

  // recessive gridlines at 0/25/50/75/100
  [0, 25, 50, 75, 100].forEach(v => {
    const x = padL + (v / 100) * plotW;
    svg.appendChild(el("line", { x1: x, x2: x, y1: padT, y2: height - 14, stroke: "var(--grid)", "stroke-width": 1 }));
    svg.appendChild(el("text", {
      x, y: height - 2, "text-anchor": "middle", "font-size": "10",
      fill: "var(--text-3)"
    }, String(v)));
  });

  PROCESS_ORDER.forEach((code, i) => {
    const y = padT + i * (rowH + gap);
    const proc = PROCESSES[code];

    svg.appendChild(el("text", {
      x: 0, y: y + rowH / 2 + 4, "font-size": "12", fill: "var(--text-2)"
    }, code + " · " + proc.name));

    series.forEach((s, si) => {
      const v = Math.max(0, Math.min(100, Number(s.vector[code]) || 0));
      const w = (v / 100) * plotW;
      const by = y + (rowH - (groups * barH + (groups - 1) * 4)) / 2 + si * (barH + 4);

      svg.appendChild(el("rect", {
        x: padL, y: by, width: Math.max(2, w), height: barH,
        rx: 4, ry: 4, fill: "var(" + s.colorVar + ")"
      }));

      // direct label — selective: the value only, at the data end
      svg.appendChild(el("text", {
        x: padL + Math.max(2, w) + 6, y: by + barH - 1,
        "font-size": "11", fill: "var(--text-2)"
      }, String(v)));

      const hit = el("rect", {
        x: padL, y: by - 2, width: plotW, height: barH + 4, fill: "transparent"
      });
      bindTip(hit, "<b>" + s.label + "</b><br>" + code + " · " + proc.name + " — <b>" + v + "</b>/100<br><span style='color:#a7b4c2'>" + proc.def + "</span>");
      svg.appendChild(hit);
    });
  });

  return svg;
}

/**
 * The projection. Corpus points are context and stay recessive; the reader's
 * own points carry the categorical colours and are labelled directly.
 */
export function corpusMap(projection, axisNames) {
  const width = 640, height = 420, pad = 44;
  const all = projection.corpus.concat(projection.points);
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = v => pad + ((v - minX) / (maxX - minX || 1)) * (width - pad * 2);
  const sy = v => height - pad - ((v - minY) / (maxY - minY || 1)) * (height - pad * 2);

  const svg = el("svg", {
    class: "chart", viewBox: "0 0 " + width + " " + height,
    role: "img", "aria-label": "Projection of the story set onto its two principal components"
  });

  svg.appendChild(el("line", { x1: pad, x2: width - pad, y1: height - pad, y2: height - pad, stroke: "var(--grid)", "stroke-width": 1 }));
  svg.appendChild(el("line", { x1: pad, x2: pad, y1: pad, y2: height - pad, stroke: "var(--grid)", "stroke-width": 1 }));
  svg.appendChild(el("text", { x: width - pad, y: height - pad + 20, "text-anchor": "end", "font-size": "11", fill: "var(--text-3)" },
    "PC1 → more " + axisNames.pc1.positive));
  svg.appendChild(el("text", { x: pad, y: pad - 14, "font-size": "11", fill: "var(--text-3)" },
    "PC2 ↑ more " + axisNames.pc2.positive));

  projection.corpus.forEach(p => {
    const dot = el("circle", { cx: sx(p.x), cy: sy(p.y), r: 5, fill: "var(--text-3)", "fill-opacity": "0.5" });
    bindTip(dot, "<b>" + p.label + "</b><br><span style='color:#a7b4c2'>in the reference set</span>");
    svg.appendChild(dot);
  });

  projection.points.forEach(p => {
    const cx = sx(p.x), cy = sy(p.y);
    const colour = p.kind === "answers" ? "var(--series-2)" : "var(--series-1)";
    svg.appendChild(el("circle", { cx, cy, r: 11, fill: "var(--surface-1)" }));       // 2px surface ring
    const dot = el("circle", { cx, cy, r: 9, fill: colour });
    bindTip(dot, "<b>" + p.label + "</b>");
    svg.appendChild(dot);
    svg.appendChild(el("text", {
      x: cx + 15, y: cy + 4, "font-size": "12", fill: "var(--text)"
    }, p.label));
  });

  return svg;
}

export function legend(items) {
  const wrap = document.createElement("p");
  wrap.className = "legend";
  items.forEach(it => {
    const key = document.createElement("span");
    key.className = "key";
    const sw = document.createElement("span");
    sw.className = "swatch" + (it.round ? " ring" : "");
    sw.style.background = it.color;
    if (it.faded) sw.style.opacity = "0.5";
    key.appendChild(sw);
    key.appendChild(document.createTextNode(it.label));
    wrap.appendChild(key);
  });
  return wrap;
}
