/* Genesis Ministry design preview: a small SVG chart helper. No dependencies.
   One axis per chart, labeled axes and values, a legend for two or more series,
   colors from the Obsidian chart tokens in a fixed order (series 1 = --v2-chart-1),
   drawn the way the Genesis OS Reports screen draws them: thin bars, quiet axes and a small legend under the plot,
   a tooltip on hover and keyboard focus, a View as Table toggle, and no motion.

   GMCharts.bar(target, opts)         vertical bars (single or grouped); opts.horizontal for rows
   GMCharts.stackedBar(target, opts)  stacked bars, same options
   GMCharts.line(target, opts)        one or more lines, gaps for null values
   GMCharts.funnel(target, opts)      stages that narrow, with the share kept at each step
   GMCharts.sparkline(target, opts)   a tiny trend for a stat tile (no axes)

   Shared options:
     title     required. The chart's name, used for the label and the table caption.
     summary   one plain sentence for screen readers.
     labels    category labels, e.g. ["Dec", "Jan", ...]
     series    [{ name, values: [..], color: 1-6 (optional), projected: { index: total } }]
     unit      "guests" or { one: "guest", many: "guests" } used in tooltips and the table
     format    function (v) returning the full value text (overrides unit)
     yTitle    the value axis title, e.g. "Guests". xTitle for the category axis.
     reference { value, label } draws one dashed line, e.g. an average or a goal
     privacy   true: counts from 1 to 4 read "fewer than 5" and draw at one height
     height    plot height in px (vertical charts). Default 240.
     table     false to drop the View as Table toggle (sparklines default to false)
     sample    false to drop the "Sample data" note
     empty     text when there is nothing to draw
   Each call returns { update(newOpts), destroy() }. */
(function (root) {
  "use strict";

  var uid = 0;
  var NS = "http://www.w3.org/2000/svg";

  function $(t) { return typeof t === "string" ? document.querySelector(t) : t; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function col(i) { return "var(--v2-chart-" + (((i - 1) % 6) + 1) + ")"; }
  function isSmall(v, o) { return o.privacy && v != null && v >= 1 && v <= 4; }
  function plotVal(v, o) { return isSmall(v, o) ? 4 : v; }
  function num(v) { return Number(v).toLocaleString("en-US"); }

  function fullValue(v, o) {
    if (v == null || v === "") return "No data";
    if (isSmall(v, o)) return "fewer than 5";
    if (o.format) return o.format(v);
    var u = o.unit, n = num(v);
    if (!u) return n;
    if (typeof u === "string") return n + " " + u;
    return n + " " + (Number(v) === 1 ? u.one : u.many);
  }
  function shortValue(v, o) {
    if (v == null) return "";
    if (isSmall(v, o)) return "<5";
    if (o.short) return o.short(v);
    return num(v);
  }

  function niceScale(max, count) {
    if (!(max > 0)) return { max: 4, step: 1 };
    var raw = max / (count || 4);
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var r = raw / mag;
    var step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
    if (step < 1) step = 1;
    return { max: Math.ceil(max / step) * step, step: step };
  }
  /* The same axis maximum at every width: the scale is worked out for four ticks, then a narrow
     plot only thins the ticks (with steps that still land on the maximum). */
  function steadyScale(max, ticks) {
    var sc = niceScale(max, 4);
    while (sc.max / sc.step > ticks + 1) {
      var next = null;
      [2, 2.5, 3, 5].some(function (f) { var s = sc.step * f, k = sc.max / s; if (Math.abs(k - Math.round(k)) < 1e-9 && k >= 1) { next = s; return true; } return false; });
      if (!next) break;
      sc.step = next;
    }
    return sc;
  }
  /* Privacy: a stacked bar whose parts include a count of 1 to 4 is drawn as one unsplit bar at its
     true total, so no exact part can be worked out from an exact total. */
  function hiddenSplit(series, i, o) {
    if (!o.privacy) return false;
    return series.some(function (s) { return isSmall(s.values[i], o); });
  }
  function totalAt(series, i) { var t = 0; series.forEach(function (s) { t += s.values[i] || 0; }); return t; }
  function smallNames(series, i, o) { return series.filter(function (s) { return isSmall(s.values[i], o); }).map(function (s) { return s.name.toLowerCase(); }); }
  function textW(s, size) { return String(s).length * (size || 11.5) * 0.56; }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, attrs) {
    var a = { x: x, y: y };
    for (var k in attrs) a[k] = attrs[k];
    var t = el("text", a, parent);
    t.textContent = s;
    return t;
  }
  function topRoundedRect(x, y, w, h, r) {
    if (h <= 0) return "";
    r = Math.min(r, w / 2, h);
    return "M" + x + "," + (y + h) + "V" + (y + r) + "Q" + x + "," + y + " " + (x + r) + "," + y + "H" + (x + w - r) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) + "V" + (y + h) + "Z";
  }
  function rightRoundedRect(x, y, w, h, r) {
    if (w <= 0) return "";
    r = Math.min(r, h / 2, w);
    return "M" + x + "," + y + "H" + (x + w - r) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) + "V" + (y + h - r) + "Q" + (x + w) + "," + (y + h) + " " + (x + w - r) + "," + (y + h) + "H" + x + "Z";
  }
  function hatchDefs(svg, id, colorIndex) {
    var defs = el("defs", {}, svg);
    var p = el("pattern", { id: id, patternUnits: "userSpaceOnUse", width: 6, height: 6, patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 6, height: 6, style: "fill:" + col(colorIndex) + ";fill-opacity:.13" }, p);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, style: "stroke:" + col(colorIndex) + ";stroke-width:2;stroke-opacity:.8" }, p);
  }

  /* --------------------------------------------------------------- frame */
  function Chart(target, opts, kind) {
    this.host = $(target);
    if (!this.host) throw new Error("GMCharts: target not found");
    this.kind = kind;
    this.id = "gmc" + (++uid);
    this.o = opts || {};
    this.build();
  }

  Chart.prototype.build = function () {
    var o = this.o, self = this;
    var wantTable = o.table !== false && this.kind !== "sparkline" || (this.kind === "sparkline" && o.table === true);
    this.host.innerHTML = "";
    var fig = document.createElement("figure");
    fig.className = "gm-chart";
    fig.style.margin = "0";
    fig.setAttribute("aria-label", o.title || "Chart");
    this.fig = fig;

    if (this.kind === "sparkline") {
      fig.className = "gm-spark";
      this.host.appendChild(fig);
      this.drawSpark();
      if (wantTable) this.addTable(fig);
      return;
    }

    var cap = document.createElement("figcaption");
    cap.className = "gm-sr-only";
    cap.textContent = (o.title || "Chart") + (o.summary ? ". " + o.summary : "");
    fig.appendChild(cap);

    var legend = this.legendItems();

    var plot = document.createElement("div");
    plot.className = "gm-chart-plot";
    plot.id = this.id + "-plot";
    fig.appendChild(plot);
    this.plot = plot;
    if (legend.length) {
      var ul = document.createElement("ul");
      ul.className = "gm-chart-legend";
      ul.innerHTML = legend.join("");
      fig.appendChild(ul);
    }
    var tip = document.createElement("div");
    tip.className = "gm-chart-tip";
    tip.setAttribute("aria-hidden", "true");
    this.tip = tip;

    if (wantTable) this.addTable(fig);
    var foot = document.createElement("div");
    foot.className = "gm-chart-foot";
    var note = o.sample === false ? "" : '<span class="gm-chart-sample">' + esc(o.sampleText || "Sample data") + "</span>";
    foot.innerHTML = note + (wantTable ? '<button type="button" class="v2-button v2-button-quiet gm-chart-toggle" aria-expanded="false" aria-controls="' + this.id + '-table">View as Table</button>' : "");
    if (note || wantTable) fig.appendChild(foot);
    this.host.appendChild(fig);

    if (wantTable) {
      var btn = foot.querySelector(".gm-chart-toggle");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        btn.textContent = open ? "View as Table" : "View as Chart";
        self.tableBox.hidden = open;
        plot.hidden = !open;
        var lg = fig.querySelector(".gm-chart-legend");
        if (lg) lg.hidden = !open;
      });
    }

    this.render();
    if ("ResizeObserver" in window) {
      var last = 0, raf = 0;
      this.ro = new ResizeObserver(function () {
        var w = Math.round(plot.clientWidth);
        if (w && Math.abs(w - last) > 2) {
          last = w;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function () { self.render(); });
        }
      });
      this.ro.observe(plot);
    }
  };

  Chart.prototype.legendItems = function () {
    var o = this.o, items = [], series = o.series || [];
    var show = series.length > 1 || this.kind === "stacked";
    if (show) series.forEach(function (s, i) {
      items.push('<li><span class="gm-chart-swatch" style="background:' + col(s.color || i + 1) + '"></span>' + esc(s.name) + "</li>");
    });
    var proj = series.some(function (s) { return s.projected; });
    if (proj) {
      if (!show) items.push('<li><span class="gm-chart-swatch" style="background:' + col(series[0].color || 1) + '"></span>' + esc(series[0].name) + "</li>");
      items.push('<li><span class="gm-chart-swatch gm-chart-swatch--hatch" style="color:' + col(series[0].color || 1) + '"></span>' + esc(o.projectedLabel || "Projected") + "</li>");
    }
    if (o.reference) items.push('<li><span class="gm-chart-swatch gm-chart-swatch--line"></span>' + esc(o.reference.label || "Reference") + "</li>");
    var self = this;
    if (this.kind === "stacked" && o.privacy && (o.labels || []).some(function (_, i) { return hiddenSplit(series, i, o); }))
      items.push('<li><span class="gm-chart-swatch" style="background:' + col((series[0] && series[0].color) || 1) + ';opacity:.5"></span>Total only: a part is fewer than 5</li>');
    return items;
  };

  Chart.prototype.addTable = function (fig) {
    var o = this.o, self = this;
    var box = document.createElement("div");
    box.className = "gm-chart-table";
    box.id = this.id + "-table";
    box.hidden = true;
    var series = o.series || [];
    var stackedPrivacy = this.kind === "stacked" && o.privacy;
    var head = "<tr><th scope=\"col\">" + esc(o.categoryTitle || o.xTitle || "Label") + "</th>" + series.map(function (s) { return '<th scope="col" class="is-num">' + esc(s.name) + "</th>"; }).join("") + (stackedPrivacy ? '<th scope="col" class="is-num">Total</th>' : "") + "</tr>";
    var projWord = o.projectedShort || "projected";
    var rows = (o.labels || []).map(function (lab, i) {
      var hide = stackedPrivacy && hiddenSplit(series, i, o);
      return "<tr><th scope=\"row\" style=\"text-transform:none;letter-spacing:0;font-size:13px;color:var(--v2-text);font-weight:500\">" + esc(lab) + "</th>" + series.map(function (s) {
        var v = s.values[i], p = s.projected && s.projected[i] != null ? s.projected[i] : null;
        var t = hide ? (isSmall(v, o) ? "fewer than 5" : "Hidden") : v == null && p != null ? "about " + fullValue(p, o) + ", " + projWord : fullValue(v, o) + (p != null && p > v ? ", about " + shortValue(p, o) + " " + projWord : "");
        return '<td class="is-num">' + esc(t) + "</td>";
      }).join("") + (stackedPrivacy ? '<td class="is-num">' + esc(fullValue(totalAt(series, i), o)) + "</td>" : "") + "</tr>";
    }).join("");
    if (o.reference) rows += '<tr><th scope="row" style="text-transform:none;letter-spacing:0;font-size:13px;background:transparent;font-weight:500;color:var(--gm-muted)">' + esc(o.reference.label || "Reference") + '</th><td class="is-num gm-muted" colspan="' + series.length + '">' + esc(fullValue(o.reference.value, o)) + "</td></tr>";
    box.innerHTML = '<div class="v2-table-scroll"><table class="v2-table"><caption>' + esc(o.title || "Chart") + (o.sample === false ? "" : ". Sample data.") + "</caption><thead>" + head + "</thead><tbody>" + rows + "</tbody></table></div>";
    fig.appendChild(box);
    this.tableBox = box;
  };

  Chart.prototype.update = function (opts) {
    for (var k in opts) this.o[k] = opts[k];
    if (this.ro) this.ro.disconnect();
    this.build();
  };
  Chart.prototype.destroy = function () { if (this.ro) this.ro.disconnect(); this.host.innerHTML = ""; };

  Chart.prototype.isEmpty = function () {
    var s = this.o.series || [];
    if (!this.o.labels || !this.o.labels.length || !s.length) return true;
    return !s.some(function (x) { return x.values.some(function (v) { return v; }) || x.projected; });
  };

  Chart.prototype.render = function () {
    this.plot.innerHTML = "";
    if (this.isEmpty()) {
      this.plot.innerHTML = '<p class="gm-chart-empty">' + esc(this.o.empty || "Nothing to show yet.") + "</p>";
      return;
    }
    var W = Math.max(260, Math.round(this.plot.clientWidth || this.host.clientWidth || 600));
    this.W = W;
    if (this.kind === "funnel") this.drawFunnel(W);
    else if (this.kind === "line") this.drawLine(W);
    else if (this.o.horizontal) this.drawHBars(W);
    else this.drawBars(W);
    this.plot.appendChild(this.tip);
  };

  /* --------------------------------------------------------------- interaction */
  Chart.prototype.wirePoints = function (svg, points) {
    var self = this;
    points.forEach(function (p, i) {
      var g = p.g;
      g.setAttribute("tabindex", i === 0 ? "0" : "-1");
      g.setAttribute("role", "img");
      g.setAttribute("aria-label", p.aria);
      g.addEventListener("mouseenter", function () { self.showTip(p); });
      g.addEventListener("mouseleave", function () { self.hideTip(); });
      g.addEventListener("focus", function () { self.showTip(p); });
      g.addEventListener("blur", function () { self.hideTip(); });
      g.addEventListener("click", function () { self.showTip(p); });
      g.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight" || k === "ArrowDown") j = Math.min(points.length - 1, i + 1);
        else if (k === "ArrowLeft" || k === "ArrowUp") j = Math.max(0, i - 1);
        else if (k === "Home") j = 0;
        else if (k === "End") j = points.length - 1;
        else if (k === "Escape") { self.hideTip(); return; }
        if (j < 0) return;
        e.preventDefault();
        g.setAttribute("tabindex", "-1");
        points[j].g.setAttribute("tabindex", "0");
        points[j].g.focus();
      });
    });
  };
  Chart.prototype.showTip = function (p) {
    var tip = this.tip;
    tip.innerHTML = "<b>" + esc(p.title) + "</b>" + p.lines.map(function (l) {
      return "<span>" + (l.color ? '<i style="background:' + l.color + '"></i>' : "") + esc(l.text) + "</span>";
    }).join("");
    tip.classList.add("is-on");
    var pw = this.plot.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
    var scale = pw / this.W;
    var x = p.x * scale, y = p.y * scale;
    var left = Math.max(0, Math.min(pw - tw, x - tw / 2));
    var top = y - th - 10;
    if (top < 0) top = y + 14;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  };
  Chart.prototype.hideTip = function () { this.tip.classList.remove("is-on"); };

  /* --------------------------------------------------------------- vertical bars */
  Chart.prototype.drawBars = function (W) {
    var o = this.o, series = o.series, labels = o.labels, n = labels.length;
    var stacked = this.kind === "stacked";
    var H = o.height || 240;
    var max = 0;
    labels.forEach(function (_, i) {
      if (stacked) {
        var t = 0; series.forEach(function (s) { t += plotVal(s.values[i] || 0, o); });
        if (hiddenSplit(series, i, o)) t = plotVal(totalAt(series, i), o);
        max = Math.max(max, t);
      } else series.forEach(function (s) {
        max = Math.max(max, plotVal(s.values[i] || 0, o), s.projected && s.projected[i] != null ? s.projected[i] : 0);
      });
    });
    if (o.reference) max = Math.max(max, o.reference.value);
    var sc = niceScale(o.yMax || max * 1.08, 4);
    var anyHidden = false;
    var tickW = Math.max(textW(num(sc.max)), 14);
    var left = Math.round(tickW + 14), right = 12, top = o.yTitle ? 30 : 16, bottom = o.xTitle ? 46 : 28;
    var pw = W - left - right, ph = H;
    var totalH = top + ph + bottom;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + totalH, width: W, height: totalH, role: "group", "aria-label": (o.title || "Chart") + (o.summary ? ". " + o.summary : "") });
    var hatchId = this.id + "-hatch";
    hatchDefs(svg, hatchId, (series[0] && series[0].color) || 1);
    var y = function (v) { return top + ph - (v / sc.max) * ph; };

    if (o.yTitle) txt(svg, 0, 12, o.yTitle, { "class": "gm-ch-axis-title" });
    for (var t = 0; t <= sc.max + 0.0001; t += sc.step) {
      el("line", { x1: left, x2: W - right, y1: y(t), y2: y(t), "class": "gm-ch-grid" }, svg);
      txt(svg, left - 8, y(t) + 4, num(Math.round(t * 10) / 10), { "text-anchor": "end" });
    }
    el("line", { x1: left, x2: W - right, y1: top + ph, y2: top + ph, "class": "gm-ch-axis" }, svg);

    var band = pw / n;
    var k = stacked ? 1 : series.length;
    var showVals = o.showValues !== false && band >= 22;
    /* Grouped bars widen a little when there is room, so each bar can carry its own value. */
    var barW = k === 1 ? Math.max(6, Math.min(14, band * 0.22)) : Math.max(5, Math.min(showVals ? 16 : 8, (band * 0.62) / k));
    var groupW = barW * k + (k - 1) * 2;
    var labelEvery = Math.max(1, Math.ceil((textW(labels.reduce(function (a, b) { return String(b).length > String(a).length ? b : a; }, "")) + 8) / band));
    var points = [];
    var self = this;

    labels.forEach(function (lab, i) {
      var cx = left + band * i + band / 2;
      var g = el("g", { "class": "gm-ch-point" }, svg);
      el("rect", { x: left + band * i + 1, y: top, width: band - 2, height: ph, rx: 4, "class": "gm-ch-hit" }, g);
      var lines = [], peak = top + ph, stackBase = 0, total = 0, anyVal = false;
      if (stacked && hiddenSplit(series, i, o)) {
        /* One unsplit bar at the true total; the parts stay private. */
        anyHidden = true;
        var tot = totalAt(series, i), tpv = plotVal(tot, o);
        if (tpv > 0) el("path", { d: topRoundedRect(cx - barW / 2, y(tpv), barW, top + ph - y(tpv), 2), style: "fill:" + col((series[0] && series[0].color) || 1) + ";fill-opacity:.5" }, g);
        peak = y(tpv);
        if (showVals) txt(g, cx, peak - 6, shortValue(tot, o), { "text-anchor": "middle", "class": "gm-ch-value" });
        lines.push({ text: "Total: " + fullValue(tot, o) });
        lines.push({ text: "Split hidden: " + smallNames(series, i, o).join(" and ") + " is fewer than 5" });
        if ((n - 1 - i) % labelEvery === 0) txt(svg, cx, top + ph + 18, lab, { "text-anchor": "middle" });
        var fl = o.fullLabels ? o.fullLabels[i] : lab;
        points.push({ g: g, x: cx, y: peak, title: fl, lines: lines, aria: fl + ": " + lines.map(function (l) { return l.text; }).join("; ") });
        return;
      }
      series.forEach(function (s, si) {
        var v = s.values[i], c = col(s.color || si + 1);
        var pv = plotVal(v || 0, o);
        var proj = s.projected && s.projected[i] != null ? s.projected[i] : null;
        if (v != null) anyVal = true;
        if (stacked) {
          var y0 = y(stackBase), y1 = y(stackBase + pv);
          var gap = stackBase > 0 ? 2 : 0;
          if (pv > 0) {
            var isTop = !series.slice(si + 1).some(function (s2) { return (s2.values[i] || 0) > 0; });
            if (isTop) el("path", { d: topRoundedRect(cx - barW / 2, y1, barW, Math.max(0, y0 - y1 - gap), 2), style: "fill:" + c }, g);
            else el("rect", { x: cx - barW / 2, y: y1, width: barW, height: Math.max(0, y0 - y1 - gap), style: "fill:" + c }, g);
          }
          stackBase += pv; total += v || 0;
          peak = Math.min(peak, y(stackBase));
          lines.push({ color: c, text: s.name + ": " + fullValue(v, o) });
        } else {
          var x = cx - groupW / 2 + si * (barW + 2);
          if (v != null && pv > 0) el("path", { d: topRoundedRect(x, y(pv), barW, top + ph - y(pv), 2), style: "fill:" + c }, g);
          if (proj != null && proj > (v || 0)) {
            var base = v || 0;
            el("path", { d: topRoundedRect(x, y(proj), barW, y(base) - y(proj) - (v ? 2 : 0), 2), fill: "url(#" + hatchId + ")", style: "stroke:" + c + ";stroke-opacity:.55;stroke-width:1" }, g);
            peak = Math.min(peak, y(proj));
          }
          if (v != null) peak = Math.min(peak, y(pv));
          var line = (series.length > 1 ? s.name + ": " : "") + (v == null && proj != null ? "about " + fullValue(proj, o) + " projected" : fullValue(v, o) + (proj != null && proj > v ? " so far, about " + shortValue(proj, o) + " projected" : ""));
          lines.push({ color: series.length > 1 ? c : null, text: line });
          if (showVals && k === 1) {
            if (proj != null && proj > (v || 0)) {
              /* Projected: the real count sits inside the solid bar, the likely finish above the hatch. */
              txt(g, cx, y(proj) - 6, (v != null ? shortValue(v, o) + ", " : "") + "~" + shortValue(proj, o), { "text-anchor": "middle", "class": "gm-ch-proj" });
            } else if (v != null) {
              txt(g, cx, y(pv) - 6, shortValue(v, o), { "text-anchor": "middle", "class": "gm-ch-value" });
            }
          } else if (showVals && k > 1 && barW >= 10 && v != null) {
            txt(g, x + barW / 2, y(pv) - 5, shortValue(v, o), { "text-anchor": "middle", "class": "gm-ch-value", style: "font-size:10.5px" });
          }
        }
      });
      if (stacked && showVals) txt(g, cx, peak - 6, shortValue(total, o), { "text-anchor": "middle", "class": "gm-ch-value" });
      if (stacked) lines.push({ text: "Total: " + fullValue(total, o) });
      if ((n - 1 - i) % labelEvery === 0) txt(svg, cx, top + ph + 18, lab, { "text-anchor": "middle" });
      var full = o.fullLabels ? o.fullLabels[i] : lab;
      points.push({ g: g, x: cx, y: peak, title: full, lines: lines, aria: full + ": " + lines.map(function (l) { return l.text; }).join("; ") });
    });

    if (o.reference) {
      var ry = y(o.reference.value);
      el("line", { x1: left, x2: W - right, y1: ry, y2: ry, "class": "gm-ch-ref" }, svg);
      /* The legend names the line. An inline label is opt-in: reference.inline = true. */
      if (o.reference.inline) txt(svg, left + 4, ry - 6, o.reference.label || "", { "class": "gm-ch-ref-label" });
    }
    if (o.xTitle) txt(svg, left + pw / 2, top + ph + 40, o.xTitle, { "text-anchor": "middle", "class": "gm-ch-axis-title" });
    this.plot.appendChild(svg);
    this.wirePoints(svg, points);
    this.hiddenSplit = anyHidden;
  };

  /* --------------------------------------------------------------- horizontal bars */
  Chart.prototype.drawHBars = function (W) {
    var o = this.o, series = o.series, labels = o.labels, n = labels.length;
    var stacked = this.kind === "stacked";
    var rowH = o.rowHeight || (series.length > 1 && !stacked ? 40 : 34);
    var labelW = Math.min(W * 0.42, Math.max.apply(null, labels.map(function (l) { return textW(l, 12.5); })) + 14);
    var anySplit = stacked && labels.some(function (_, i) { return hiddenSplit(series, i, o); });
    var anyProj = !stacked && series.some(function (s) { return s.projected; });
    var narrowSplit = anySplit && W < 560;
    var valueRoom = anySplit ? (narrowSplit ? 66 : 112) : anyProj ? 96 : 76;
    var left = Math.round(labelW), right = valueRoom, top = o.yTitle ? 22 : 6, bottom = o.xTitle ? 46 : 26;
    var pw = W - left - right;
    var ph = n * rowH;
    var totalH = top + ph + bottom;
    var max = 0;
    labels.forEach(function (_, i) {
      if (stacked) { var t = 0; series.forEach(function (s) { t += plotVal(s.values[i] || 0, o); }); if (hiddenSplit(series, i, o)) t = plotVal(totalAt(series, i), o); max = Math.max(max, t); }
      else series.forEach(function (s) { max = Math.max(max, plotVal(s.values[i] || 0, o), s.projected && s.projected[i] != null ? s.projected[i] : 0); });
    });
    if (o.reference) max = Math.max(max, o.reference.value);
    var sc = steadyScale(o.yMax || max * 1.05, Math.max(2, Math.min(5, Math.floor(pw / 90))));
    var x = function (v) { return left + (v / sc.max) * pw; };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + totalH, width: W, height: totalH, role: "group", "aria-label": (o.title || "Chart") + (o.summary ? ". " + o.summary : "") });
    var hatchId = this.id + "-hatch";
    if (anyProj) hatchDefs(svg, hatchId, (series[0] && series[0].color) || 1);
    if (o.yTitle) txt(svg, 0, 12, o.yTitle, { "class": "gm-ch-axis-title" });
    for (var t = 0; t <= sc.max + 0.0001; t += sc.step) {
      el("line", { x1: x(t), x2: x(t), y1: top, y2: top + ph, "class": "gm-ch-grid" }, svg);
      txt(svg, x(t), top + ph + 16, num(Math.round(t * 10) / 10), { "text-anchor": "middle" });
    }
    el("line", { x1: left, x2: left, y1: top, y2: top + ph, "class": "gm-ch-axis" }, svg);
    var k = stacked ? 1 : series.length;
    var barH = Math.min(10, (rowH - 14) / k);
    var points = [];
    labels.forEach(function (lab, i) {
      var cy = top + rowH * i + rowH / 2;
      var g = el("g", { "class": "gm-ch-point" }, svg);
      el("rect", { x: 0, y: top + rowH * i + 1, width: W, height: rowH - 2, rx: 6, "class": "gm-ch-hit" }, g);
      txt(g, left - 10, cy + 4, lab, { "text-anchor": "end", style: "fill:var(--v2-text-2);font-size:12px" });
      var lines = [], base = 0, total = 0, endX = left;
      if (stacked && hiddenSplit(series, i, o)) {
        /* One unsplit bar at the true total, labeled with which part is fewer than 5. */
        var tot = totalAt(series, i), tpv = plotVal(tot, o), names = smallNames(series, i, o);
        if (tpv > 0) el("rect", { x: left, y: cy - barH / 2, width: Math.max(0, x(tpv) - left), height: barH, rx: 2, style: "fill:" + col((series[0] && series[0].color) || 1) + ";fill-opacity:.5" }, g);
        if (o.showValues !== false) txt(g, x(tpv) + 6, cy + 4, shortValue(tot, o) + (isSmall(tot, o) ? "" : narrowSplit ? " (<5)" : " (" + names.join(", ") + " <5)"), { "class": "gm-ch-value" });
        lines.push({ text: "Total: " + fullValue(tot, o) });
        lines.push({ text: "Split hidden: " + names.join(" and ") + " is fewer than 5" });
        points.push({ g: g, x: Math.min(W - 60, Math.max(left + 40, x(tpv))), y: cy - barH / 2, title: lab, lines: lines, aria: lab + ": " + lines.map(function (l) { return l.text; }).join("; ") });
        return;
      }
      series.forEach(function (s, si) {
        var v = s.values[i], c = col(s.color || si + 1), pv = plotVal(v || 0, o);
        var proj = !stacked && s.projected && s.projected[i] != null ? s.projected[i] : null;
        if (proj != null && v == null) {
          /* A target, not a result: drawn hatched, labeled as a target. */
          var pby = cy - (k * barH + (k - 1) * 2) / 2 + si * (barH + 2);
          el("path", { d: rightRoundedRect(left, pby, x(proj) - left, barH, 2), fill: "url(#" + hatchId + ")", style: "stroke:" + c + ";stroke-opacity:.55;stroke-width:1" }, g);
          if (o.showValues !== false) txt(g, x(proj) + 6, pby + barH / 2 + 4, "~" + shortValue(proj, o) + " " + (o.projectedShort || "target"), { "class": "gm-ch-proj" });
          lines.push({ color: series.length > 1 ? c : null, text: (series.length > 1 ? s.name + ": " : "") + "about " + fullValue(proj, o) + ", " + (o.projectedShort || "target") });
          return;
        }
        if (stacked) {
          var gap = base > 0 ? 2 : 0;
          if (pv > 0) el("rect", { x: x(base) + gap, y: cy - barH / 2, width: Math.max(0, x(base + pv) - x(base) - gap), height: barH, rx: 2, style: "fill:" + c }, g);
          base += pv; total += v || 0; endX = x(base);
          lines.push({ color: c, text: s.name + ": " + fullValue(v, o) });
        } else {
          var by = cy - (k * barH + (k - 1) * 2) / 2 + si * (barH + 2);
          if (pv > 0) el("path", { d: rightRoundedRect(left, by, x(pv) - left, barH, 2), style: "fill:" + c }, g);
          if (o.showValues !== false) txt(g, x(pv) + 6, by + barH / 2 + 4, shortValue(v, o), { "class": "gm-ch-value", style: k > 1 ? "font-size:10.5px" : null });
          lines.push({ color: series.length > 1 ? c : null, text: (series.length > 1 ? s.name + ": " : "") + fullValue(v, o) + (o.shareOfTotal ? shareText(v, s.values, o) : "") });
        }
      });
      if (stacked) {
        if (o.showValues !== false) txt(g, endX + 6, cy + 4, shortValue(total, o), { "class": "gm-ch-value" });
        lines.push({ text: "Total: " + fullValue(total, o) });
      }
      var px = stacked ? endX : x(plotVal(series[0].values[i] != null ? series[0].values[i] : (series[0].projected && series[0].projected[i]) || 0, o));
      points.push({ g: g, x: Math.min(W - 60, Math.max(left + 40, px)), y: cy - barH / 2, title: lab, lines: lines, aria: lab + ": " + lines.map(function (l) { return l.text; }).join("; ") });
    });
    this.hiddenSplit = anySplit;
    if (o.reference) {
      var rx = x(o.reference.value);
      el("line", { x1: rx, x2: rx, y1: top - 4, y2: top + ph, "class": "gm-ch-ref" }, svg);
    }
    if (o.xTitle) txt(svg, left + pw / 2, top + ph + 38, o.xTitle, { "text-anchor": "middle", "class": "gm-ch-axis-title" });
    this.plot.appendChild(svg);
    this.wirePoints(svg, points);
  };
  function shareText(v, all, o) {
    var sum = all.reduce(function (a, b) { return a + (b || 0); }, 0);
    if (!sum || v == null || isSmall(v, o)) return "";
    return ", " + Math.round((v / sum) * 100) + "% of all";
  }

  /* --------------------------------------------------------------- line */
  Chart.prototype.drawLine = function (W) {
    var o = this.o, series = o.series, labels = o.labels, n = labels.length;
    var H = o.height || 220;
    var max = 0;
    series.forEach(function (s) { s.values.forEach(function (v) { if (v != null) max = Math.max(max, v); }); });
    if (o.reference) max = Math.max(max, o.reference.value);
    var sc = niceScale(o.yMax || max * 1.1, 4);
    var tickW = Math.max(textW(num(sc.max)), 14);
    /* With two or more series the last values sit to the right of their points, so leave room for them. */
    var multiEnd = series.length > 1 && o.showValues !== false;
    var endW = multiEnd ? Math.max.apply(null, series.map(function (s) { var v = s.values[n - 1]; return v == null ? 0 : textW(shortValue(v, o)); })) + 12 : 0;
    var left = Math.round(tickW + 14), right = Math.max(18, Math.round(endW)), top = o.yTitle ? 30 : 16, bottom = o.xTitle ? 46 : 28;
    var pw = W - left - right, ph = H, totalH = top + ph + bottom;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + totalH, width: W, height: totalH, role: "group", "aria-label": (o.title || "Chart") + (o.summary ? ". " + o.summary : "") });
    var y = function (v) { return top + ph - (v / sc.max) * ph; };
    var band = pw / n;
    var xAt = function (i) { return left + band * i + band / 2; };
    if (o.yTitle) txt(svg, 0, 12, o.yTitle, { "class": "gm-ch-axis-title" });
    for (var t = 0; t <= sc.max + 0.0001; t += sc.step) {
      el("line", { x1: left, x2: W - right, y1: y(t), y2: y(t), "class": "gm-ch-grid" }, svg);
      txt(svg, left - 8, y(t) + 4, num(Math.round(t * 10) / 10), { "text-anchor": "end" });
    }
    el("line", { x1: left, x2: W - right, y1: top + ph, y2: top + ph, "class": "gm-ch-axis" }, svg);
    if (o.reference) {
      var ry = y(o.reference.value);
      el("line", { x1: left, x2: W - right, y1: ry, y2: ry, "class": "gm-ch-ref" }, svg);
      if (o.reference.inline) txt(svg, left + 4, ry - 6, o.reference.label || "", { "class": "gm-ch-ref-label" });
    }
    var labelEvery = Math.max(1, Math.ceil((textW(labels.reduce(function (a, b) { return String(b).length > String(a).length ? b : a; }, "")) + 10) / band));
    labels.forEach(function (lab, i) { if ((n - 1 - i) % labelEvery === 0) txt(svg, xAt(i), top + ph + 18, lab, { "text-anchor": "middle" }); });
    series.forEach(function (s, si) {
      var c = col(s.color || si + 1), d = "", pen = false;
      s.values.forEach(function (v, i) {
        if (v == null) { pen = false; return; }
        d += (pen ? "L" : "M") + xAt(i) + "," + y(v);
        pen = true;
      });
      el("path", { d: d, fill: "none", style: "stroke:" + c + ";stroke-width:2;stroke-linejoin:round;stroke-linecap:round" }, svg);
    });
    var points = [], ends = [];
    var single = series.length === 1;
    labels.forEach(function (lab, i) {
      var g = el("g", { "class": "gm-ch-point" }, svg);
      el("rect", { x: left + band * i, y: top, width: band, height: ph, rx: 6, "class": "gm-ch-hit" }, g);
      var lines = [], peak = top + ph;
      series.forEach(function (s, si) {
        var v = s.values[i], c = col(s.color || si + 1);
        if (v != null) {
          el("circle", { cx: xAt(i), cy: y(v), r: 3, style: "fill:var(--v2-surface);stroke:" + c + ";stroke-width:2" }, g);
          peak = Math.min(peak, y(v));
          var labelIt = o.showValues !== false && single && (n <= 14 || i === n - 1);
          if (labelIt) txt(g, xAt(i), y(v) - 9, shortValue(v, o), { "text-anchor": "middle", "class": "gm-ch-value" });
          if (!single && multiEnd && i === n - 1) ends.push({ g: g, y: y(v), text: shortValue(v, o) });
        }
        var extra = s.notes && s.notes[i] ? ", " + s.notes[i] : "";
        lines.push({ color: single ? null : c, text: (single ? "" : s.name + ": ") + fullValue(v, o) + extra });
      });
      var full = o.fullLabels ? o.fullLabels[i] : lab;
      points.push({ g: g, x: xAt(i), y: peak, title: full, lines: lines, aria: full + ": " + lines.map(function (l) { return l.text; }).join("; ") });
    });
    /* The last value of each series, beside its point and pushed apart so no two labels touch. */
    if (ends.length) {
      ends.sort(function (a, b) { return a.y - b.y; });
      for (var e = 1; e < ends.length; e++) if (ends[e].y - ends[e - 1].y < 12) ends[e].y = ends[e - 1].y + 12;
      var over = ends[ends.length - 1].y - (top + ph);
      if (over > 0) ends.forEach(function (it) { it.y -= over; });
      for (var e2 = ends.length - 2; e2 >= 0; e2--) if (ends[e2 + 1].y - ends[e2].y < 12) ends[e2].y = ends[e2 + 1].y - 12;
      ends.forEach(function (it) { txt(it.g, xAt(n - 1) + 8, it.y + 4, it.text, { "text-anchor": "start", "class": "gm-ch-value" }); });
    }
    if (o.xTitle) txt(svg, left + pw / 2, top + ph + 40, o.xTitle, { "text-anchor": "middle", "class": "gm-ch-axis-title" });
    this.plot.appendChild(svg);
    this.wirePoints(svg, points);
  };

  /* --------------------------------------------------------------- funnel */
  Chart.prototype.drawFunnel = function (W) {
    var o = this.o, s = o.series[0], labels = o.labels, n = labels.length;
    var rowH = 38;
    var labelW = Math.min(W * 0.34, Math.max.apply(null, labels.map(function (l) { return textW(l, 12.5); })) + 16);
    var left = Math.round(labelW), right = 120, top = 4;
    var pw = W - left - right, totalH = top + n * rowH + 6;
    var first = s.values[0] || 1;
    var c = col(s.color || 1);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + totalH, width: W, height: totalH, role: "group", "aria-label": (o.title || "Chart") + (o.summary ? ". " + o.summary : "") });
    var points = [];
    labels.forEach(function (lab, i) {
      var v = s.values[i] || 0, prev = i ? s.values[i - 1] : null;
      var cy = top + rowH * i + rowH / 2;
      var w = Math.max(3, (plotVal(v, o) / first) * pw);
      var g = el("g", { "class": "gm-ch-point" }, svg);
      el("rect", { x: 0, y: top + rowH * i + 1, width: W, height: rowH - 2, rx: 6, "class": "gm-ch-hit" }, g);
      txt(g, left - 12, cy + 4, lab, { "text-anchor": "end", "class": "gm-ch-funnel-label" });
      el("rect", { x: left, y: cy - 6, width: w, height: 12, rx: 2, style: "fill:" + c + ";fill-opacity:" + (1 - i * (0.5 / Math.max(1, n - 1))) }, g);
      txt(g, left + w + 8, cy + 4, shortValue(v, o), { "class": "gm-ch-value", style: "font-size:12px;fill:var(--v2-text)" });
      var rate = prev ? Math.round((v / prev) * 100) + "% of " + labels[i - 1] : "";
      if (rate) txt(g, left + w + 8 + textW(shortValue(v, o), 13) + 10, cy + 4, rate, { "class": "gm-ch-funnel-rate" });
      var lines = [{ text: fullValue(v, o) }];
      if (prev) lines.push({ text: rate });
      if (i) lines.push({ text: Math.round((v / first) * 100) + "% of " + labels[0] });
      points.push({ g: g, x: left + Math.min(w, pw) / 2, y: cy - 6, title: lab, lines: lines, aria: lab + ": " + lines.map(function (l) { return l.text; }).join("; ") });
    });
    this.plot.appendChild(svg);
    this.wirePoints(svg, points);
  };

  /* --------------------------------------------------------------- sparkline */
  Chart.prototype.drawSpark = function () {
    var o = this.o, vals = (o.series && o.series[0] ? o.series[0].values : o.values) || [];
    var w = o.width || 96, h = o.height || 28, pad = 3;
    var c = col((o.series && o.series[0] && o.series[0].color) || o.color || 1);
    var nums = vals.filter(function (v) { return v != null; });
    var max = Math.max.apply(null, nums.concat([1])), min = Math.min.apply(null, nums.concat([0]));
    var span = max - min || 1;
    var xAt = function (i) { return pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2); };
    var yAt = function (v) { return h - pad - ((v - min) / span) * (h - pad * 2); };
    var d = "", pen = false, lastI = -1;
    vals.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? "L" : "M") + xAt(i) + "," + yAt(v); pen = true; lastI = i; });
    var label = (o.title || "Trend") + ": " + vals.map(function (v, i) { return (o.labels ? o.labels[i] + " " : "") + fullValue(v, o); }).join(", ");
    var svg = el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, role: "img", "aria-label": label });
    var tt = el("title", {}, svg); tt.textContent = label;
    el("path", { d: d, fill: "none", style: "stroke:" + c + ";stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round" }, svg);
    if (lastI >= 0) el("circle", { cx: xAt(lastI), cy: yAt(vals[lastI]), r: 2.6, style: "fill:" + c }, svg);
    this.fig.appendChild(svg);
  };

  root.GMCharts = {
    bar: function (t, o) { return new Chart(t, o, "bar"); },
    stackedBar: function (t, o) { return new Chart(t, o, "stacked"); },
    line: function (t, o) { return new Chart(t, o, "line"); },
    funnel: function (t, o) { return new Chart(t, o, "funnel"); },
    sparkline: function (t, o) { return new Chart(t, o, "sparkline"); },
    fullValue: function (v, o) { return fullValue(v, o || {}); }
  };
})(window);
