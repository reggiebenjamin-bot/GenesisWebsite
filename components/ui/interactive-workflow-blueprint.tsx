"use client";

/* Credit: Louis Studios. https://studios.lou15.com */

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ReactFlow, Handle, Position, getBezierPath, applyNodeChanges, applyEdgeChanges, useNodesInitialized, useReactFlow,
  type Node, type Edge, type NodeProps, type EdgeProps, type Connection,
  type ReactFlowInstance, type NodeChange, type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type WorkflowKind = "trigger" | "agent" | "integration" | "review" | "delivery";
export interface WorkflowAction extends Record<string, unknown> {
  label: string;
  detail: string;
  kind: WorkflowKind;
  tool?: string;
  /** Optional tool mark; it is decorative beside the text label. */
  logo?: string;
}
export interface WorkflowApp {
  id: string;
  name: string;
  logo?: string;
  actions: WorkflowAction[];
}
export type WorkflowNode = Node<WorkflowAction, "blueprint">;
export interface WorkflowGraph { nodes: WorkflowNode[]; edges: Edge[] }
export interface WorkflowBlueprintProps {
  /** Initial graph. Change the component's key to load a different document. */
  initialGraph: WorkflowGraph;
  apps: WorkflowApp[];
  title?: string;
  className?: string;
  style?: CSSProperties;
  animated?: boolean;
  /** Starting content for the Add agent button. The step can be edited in the demo. */
  agentTemplate?: WorkflowAction;
  /** Fires after edits and node moves. Persistence belongs to the host app. */
  onChange?: (graph: WorkflowGraph) => void;
}

const labels: Record<WorkflowKind, string> = {
  trigger: "Trigger", agent: "AI agent", integration: "Integration", review: "Review", delivery: "Delivery",
};
const glyphs: Record<WorkflowKind, string> = {
  trigger: "M13 3 5 13h5l-1 8 9-12h-5z",
  agent: "M12 3l2.2 5.5L20 10l-5.8 1.5L12 17l-2.2-5.5L4 10l5.8-1.5z",
  integration: "M10.5 13.5a3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1 1 M13.5 10.5a3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1-1",
  review: "M12 3 4 7v5c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V7z M9 12l2 2 4-5",
  delivery: "M5 12h12M13 6l6 6-6 6",
};

function BrandMark({ src, fallback }: { src?: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    // Decorative beside the text label. A missing file falls back to the kind glyph.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" onError={() => setFailed(true)} />
  ) : fallback;
}

function BlueprintNode({ data, selected }: NodeProps<WorkflowNode>) {
  return <div className="wb-node" data-kind={data.kind} data-selected={selected}>
    <Handle type="target" position={Position.Left} aria-label={`Input for ${data.label}`} />
    <div className="wb-node-head">
      <span className="wb-glyph"><BrandMark key={data.logo} src={data.logo} fallback={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[data.kind]} /></svg>} /></span>
      <div><strong>{data.label}</strong><small>{labels[data.kind]}</small></div>
    </div>
    <div className="wb-node-body"><p>{data.detail}</p>{data.tool && <span>{data.tool}</span>}</div>
    <Handle type="source" position={Position.Right} aria-label={`Output for ${data.label}`} />
  </div>;
}

function BlueprintEdge(props: EdgeProps) {
  const gradient = `wb-${useId().replace(/:/g, "")}`;
  const [path] = getBezierPath(props);
  return <>
    <defs><linearGradient id={gradient}><stop stopColor="var(--wb-primary)" /><stop offset="1" stopColor="var(--wb-secondary)" /></linearGradient></defs>
    <path d={path} className="wb-edge-halo" />
    <path d={path} className="wb-edge" style={{ stroke: `url(#${gradient})` }} />
    <path d={path} className="wb-edge-pulse" />
    <circle cx={props.sourceX} cy={props.sourceY} r="4" className="wb-port" />
    <circle cx={props.targetX} cy={props.targetY} r="4" className="wb-port" />
  </>;
}
const nodeTypes = { blueprint: BlueprintNode };
const edgeTypes = { blueprint: BlueprintEdge };

function InitialViewport({ width }: { width: number }) {
  const ready = useNodesInitialized();
  const flow = useReactFlow();
  const previousWidth = useRef(0);
  useEffect(() => {
    if (!ready || !width || previousWidth.current === width) return;
    // React Flow measures its own pane in a ResizeObserver too. Wait for that
    // measurement before fitting, otherwise a resized canvas uses stale bounds.
    let nextFrame = 0;
    const frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        previousWidth.current = width;
        if (width < 600) void flow.setViewport({ x: 24, y: 20, zoom: 0.9 });
        else void flow.fitView({ padding: 0.10, maxZoom: 1 });
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame); };
  }, [ready, width, flow]);
  return null;
}

/** Reject duplicate links, self-links and cycles for both handle and form connections. */
function canConnect(connection: Pick<Connection, "source" | "target">, graph: WorkflowGraph) {
  const { source, target } = connection;
  if (!source || !target || source === target || !graph.nodes.some(n => n.id === source) || !graph.nodes.some(n => n.id === target)) return false;
  if (graph.edges.some(e => e.source === source && e.target === target)) return false;
  const visited = new Set<string>();
  const reachesSource = (id: string): boolean => {
    if (id === source) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    return graph.edges.filter(e => e.source === id).some(e => reachesSource(e.target));
  };
  return !reachesSource(target);
}

function normalizeGraph(graph: WorkflowGraph): WorkflowGraph {
  const ids = new Set(graph.nodes.map(n => n.id));
  return {
    nodes: graph.nodes.map(n => ({ ...n, type: "blueprint", ariaLabel: `${n.data.label}. ${labels[n.data.kind]}. ${n.data.detail}`, data: { ...n.data } })),
    edges: graph.edges.filter(e => ids.has(e.source) && ids.has(e.target)).map(e => ({ ...e, type: "blueprint", ariaLabel: `Connection from ${graph.nodes.find(n => n.id === e.source)?.data.label} to ${graph.nodes.find(n => n.id === e.target)?.data.label}` })),
  };
}

export default function WorkflowBlueprint({ initialGraph, apps, title = "Workflow editor", className = "", style, animated = true, agentTemplate, onChange }: WorkflowBlueprintProps) {
  const [graph, setGraph] = useState(() => normalizeGraph(initialGraph));
  const [selected, setSelected] = useState(initialGraph.nodes[0]?.id ?? "");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("Choose an action or drag a node to start.");
  const [history, setHistory] = useState<WorkflowGraph[]>([]);
  const [flow, setFlow] = useState<ReactFlowInstance<WorkflowNode> | null>(null);
  const [width, setWidth] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [editing, setEditing] = useState<{ id: string; label: string; detail: string; tool: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance<WorkflowNode> | null>(null);
  const editLabelRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLSelectElement>(null);
  const initialRef = useRef(normalizeGraph(initialGraph));
  const sequence = useRef(0);
  const uid = useId().replace(/:/g, "");
  const changed = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (changed.current) onChangeRef.current?.(graph);
  }, [graph]);
  const editingId = editing?.id;
  useEffect(() => {
    if (editingId) editLabelRef.current?.focus();
  }, [editingId]);
  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const commit = (next: WorkflowGraph, announcement: string) => {
    setHistory(h => [...h.slice(-19), graph]);
    changed.current = true;
    setGraph(normalizeGraph(next));
    setMessage(announcement);
  };
  const connect = (connection: Pick<Connection, "source" | "target">) => {
    if (!canConnect(connection, graph)) { setMessage("Choose two different nodes without an existing link or a cycle."); return; }
    commit({ ...graph, edges: [...graph.edges, { id: `${uid}-edge-${++sequence.current}`, ...connection, type: "blueprint" }] }, "Connection added.");
  };
  const add = (action: WorkflowAction, editNow = false) => {
    if (graph.nodes.length >= 20) { setMessage("This canvas supports up to 20 nodes. Remove a node before adding another."); return; }
    const after = graph.nodes.find(n => n.id === selected);
    const id = `${uid}-node-${++sequence.current}`;
    const position = { x: after ? after.position.x + 260 : 30, y: after ? after.position.y : 80 };
    while (graph.nodes.some(n => Math.abs(n.position.x - position.x) < 212 && Math.abs(n.position.y - position.y) < 184)) position.y += 194;
    const node: WorkflowNode = { id, type: "blueprint", position, data: { ...action }, selected: true };
    const outgoing = graph.edges.filter(e => e.source === after?.id);
    let edges = graph.edges;
    // A single successor can be preserved when inserting. Branches are never silently rewired.
    if (after) {
      if (outgoing.length === 1) edges = edges.map(e => e.id === outgoing[0].id ? { ...e, source: id } : e);
      edges = [...edges, { id: `${uid}-edge-${++sequence.current}`, source: after.id, target: id, type: "blueprint" }];
    }
    commit({ nodes: [...graph.nodes.map(n => ({ ...n, selected: false })), node], edges }, `${action.label} added${after ? ` after ${after.data.label}` : ""}.`);
    setSelected(id);
    setEditing(editNow ? { id, label: action.label, detail: action.detail, tool: action.tool ?? "" } : null);
    void flow?.setCenter(position.x + 98, position.y + 84, { zoom: width < 600 ? 0.9 : 1 });
  };
  const remove = () => {
    const node = graph.nodes.find(n => n.id === selected);
    if (!node) return;
    const incoming = graph.edges.filter(edge => edge.target === selected);
    const outgoing = graph.edges.filter(edge => edge.source === selected);
    const remaining = { nodes: graph.nodes.filter(n => n.id !== selected), edges: graph.edges.filter(e => e.source !== selected && e.target !== selected) };
    const bridge = incoming.length === 1 && outgoing.length === 1 ? { source: incoming[0].source, target: outgoing[0].target } : null;
    const reconnect = bridge && canConnect(bridge, remaining);
    if (reconnect) remaining.edges.push({ id: `${uid}-edge-${++sequence.current}`, ...bridge, type: "blueprint" });
    commit(remaining, reconnect ? `${node.data.label} removed. The surrounding steps remain connected.` : `${node.data.label} and its connections removed.`);
    setSelected("");
    setEditing(null);
    selectedRef.current?.focus();
  };
  const onNodesChange = useCallback((changes: NodeChange<WorkflowNode>[]) => {
    changed.current = true;
    setGraph(g => {
      const viewport = flowRef.current?.getViewport();
      const canvas = canvasRef.current?.getBoundingClientRect();
      const boundedChanges = changes.map(change => {
        if (change.type !== "position" || !change.position || !viewport || !canvas) return change;
        const node = g.nodes.find(item => item.id === change.id);
        if (!node) return change;
        const inset = 4;
        const minX = (inset - viewport.x) / viewport.zoom;
        const minY = (inset - viewport.y) / viewport.zoom;
        const maxX = (canvas.width - inset - viewport.x) / viewport.zoom - (node.measured?.width ?? 196);
        const maxY = (canvas.height - inset - viewport.y) / viewport.zoom - (node.measured?.height ?? 166);
        return { ...change, position: {
          x: Math.max(minX, Math.min(change.position.x, Math.max(minX, maxX))),
          y: Math.max(minY, Math.min(change.position.y, Math.max(minY, maxY))),
        } };
      });
      return { ...g, nodes: applyNodeChanges(boundedChanges, g.nodes) };
    });
    const selection = changes.find(c => c.type === "select" && c.selected);
    if (selection && "id" in selection) setSelected(selection.id);
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changed.current = true;
    setGraph(g => ({ ...g, edges: applyEdgeChanges(changes, g.edges) }));
  }, []);
  const focusNode = (id: string) => {
    setSelected(id);
    setEditing(null);
    setGraph(g => ({ ...g, nodes: g.nodes.map(n => ({ ...n, selected: n.id === id })) }));
    const node = graph.nodes.find(n => n.id === id);
    if (node) void flow?.setCenter(node.position.x + 98, node.position.y + 84, { zoom: 1 });
  };
  const editSelected = () => {
    const node = graph.nodes.find(item => item.id === selected);
    if (node) setEditing({ id: node.id, label: node.data.label, detail: node.data.detail, tool: node.data.tool ?? "" });
  };
  const saveStep = () => {
    if (!editing || !editing.label.trim()) return;
    const name = editing.label.trim();
    commit({ ...graph, nodes: graph.nodes.map(node => node.id === editing.id
      ? { ...node, data: { ...node.data, label: name, detail: editing.detail.trim(), tool: editing.tool.trim() || undefined } }
      : node) }, `${name} updated.`);
    setEditing(null);
    editButtonRef.current?.focus();
  };
  const download = () => {
    const clean = { nodes: graph.nodes.map(({ id, position, data }) => ({ id, type: "blueprint", position, data })), edges: graph.edges.map(({ id, source, target }) => ({ id, source, target, type: "blueprint" })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "workflow.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Workflow downloaded as JSON. No live integrations are connected.");
  };

  return <section className={`wb-root ${className}`} style={style} aria-label={title} data-animated={animated && !motionPaused}>
    <style>{styles}</style>
    <header className="wb-header">
      <span className="wb-mark" aria-hidden="true">+</span>
      <div className="wb-heading"><h2>{title}</h2><span>Build canvas</span></div>
      <div className="wb-header-actions"><button type="button" onClick={() => add({ ...agentTemplate, label: agentTemplate?.label ?? "New AI agent", detail: agentTemplate?.detail ?? "Describe what this agent does.", kind: "agent" }, true)} disabled={graph.nodes.length >= 20}>+ Add agent</button><button type="button" onClick={() => { const previous = history.at(-1); if (previous) { changed.current = true; setGraph(previous); setHistory(h => h.slice(0, -1)); setSelected(""); setEditing(null); setMessage("Last edit undone."); } }} disabled={!history.length}>Undo edit</button><button type="button" className="wb-primary" onClick={download}>Export JSON <span aria-hidden="true">↗</span></button></div>
    </header>
    <div className="wb-workspace">
      <div className="wb-canvas-column">
        <div className="wb-canvas" ref={canvasRef}>
          <ReactFlow<WorkflowNode> nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            onInit={instance => { flowRef.current = instance; setFlow(instance); }} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect}
            isValidConnection={connection => canConnect(connection, graph)}
            onNodeClick={(_, node) => { setSelected(node.id); setEditing(null); }}
            nodesFocusable edgesFocusable disableKeyboardA11y={false}
            minZoom={0.3} maxZoom={1.5} zoomOnScroll={false} zoomOnDoubleClick={false} autoPanOnNodeDrag={false} preventScrolling={false}
            deleteKeyCode={null} snapToGrid snapGrid={[10, 10]} aria-label={`${title} diagram`}
            >
            <InitialViewport width={width} />
          </ReactFlow>
          {!graph.nodes.length && <p className="wb-empty">Add an action from the connection stack to begin.</p>}
          <div className="wb-tools" role="group" aria-label="Canvas controls">
            <button type="button" aria-label="Zoom out" onClick={() => void flow?.zoomOut()}>−</button>
            <button type="button" onClick={() => void flow?.fitView({ padding: 0.15, maxZoom: 1 })}>Fit all</button>
            <button type="button" aria-label="Zoom in" onClick={() => void flow?.zoomIn()}>+</button>
            {animated && <button type="button" onClick={() => setMotionPaused(p => !p)} aria-pressed={motionPaused}>{motionPaused ? "Resume motion" : "Pause motion"}</button>}
          </div>
        </div>
        <div className="wb-status"><span><i aria-hidden="true" /> {graph.nodes.length} nodes · {graph.edges.length} connections</span><span>Local canvas · no live services</span></div>
        <div className="wb-editor">
          <div className="wb-edit-row"><label htmlFor={`${uid}-selected`}>Insert after / selected node</label><select ref={selectedRef} id={`${uid}-selected`} value={graph.nodes.some(n => n.id === selected) ? selected : ""} onChange={e => focusNode(e.target.value)}><option value="">Unconnected new node</option>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select><button ref={editButtonRef} type="button" onClick={editSelected} disabled={!graph.nodes.some(n => n.id === selected)}>Edit step</button><button type="button" onClick={remove} disabled={!graph.nodes.some(n => n.id === selected)}>Remove selected</button></div>
          {editing && <form className="wb-step-form" onSubmit={event => { event.preventDefault(); saveStep(); }}>
            <label>Step name<input ref={editLabelRef} required maxLength={60} value={editing.label} onChange={event => setEditing({ ...editing, label: event.target.value })} /></label>
            <label>What it does<textarea maxLength={160} rows={2} value={editing.detail} onChange={event => setEditing({ ...editing, detail: event.target.value })} /></label>
            <label>Tool (optional)<input maxLength={40} value={editing.tool} onChange={event => setEditing({ ...editing, tool: event.target.value })} /></label>
            <div><button type="submit" className="wb-primary">Save step</button><button type="button" onClick={() => { setEditing(null); editButtonRef.current?.focus(); }}>Cancel</button></div>
          </form>}
          <form className="wb-connect" onSubmit={e => { e.preventDefault(); connect({ source, target }); }}>
            <label>From<select value={source} onChange={e => setSource(e.target.value)}><option value="">Choose source</option>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select></label>
            <span aria-hidden="true">→</span>
            <label>To<select value={target} onChange={e => setTarget(e.target.value)}><option value="">Choose destination</option>{graph.nodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}</select></label>
            <button type="submit" disabled={!source || !target}>Connect nodes</button>
          </form>
          <details className="wb-details"><summary>Connections ({graph.edges.length}) and keyboard help</summary><p>Tab to a node, press Enter to select it, then use the arrow keys to move it. Drag between ports or use the connection form. Removing a step reconnects its neighbors when there is one incoming and one outgoing connection; branches must be connected manually. Undo edit restores the last addition, removal or connection.</p>{graph.edges.length ? <ul>{graph.edges.map(edge => <li key={edge.id}><span>{graph.nodes.find(n => n.id === edge.source)?.data.label} → {graph.nodes.find(n => n.id === edge.target)?.data.label}</span><button type="button" aria-label={`Remove connection from ${graph.nodes.find(n => n.id === edge.source)?.data.label} to ${graph.nodes.find(n => n.id === edge.target)?.data.label}`} onClick={() => commit({ ...graph, edges: graph.edges.filter(e => e.id !== edge.id) }, "Connection removed.")}>Remove</button></li>)}</ul> : <p>No connections yet.</p>}</details>
          <p className="wb-message" role="status" aria-live="polite">{message}</p>
          <button type="button" className="wb-reset" onClick={() => { commit(normalizeGraph(initialRef.current), "Initial workflow restored. Undo edit can recover your changes."); setSelected(initialRef.current.nodes[0]?.id ?? ""); setEditing(null); }}>Restore initial workflow</button>
        </div>
      </div>
      <aside className="wb-stack" aria-label="Connection stack">
        <div className="wb-stack-heading"><h3>Connection stack</h3><span aria-hidden="true">▱</span></div>
        <p>Pick an action to add it after the selected node.</p>
        {apps.map((app, index) => <details key={app.id} open={index === 0} className="wb-app">
          <summary><span className="wb-app-mark" aria-hidden="true"><BrandMark key={app.logo} src={app.logo} fallback={app.name.slice(0, 1)} /></span><strong>{app.name}</strong><small>{app.actions.length}</small></summary>
          <div className="wb-actions">{app.actions.map((action, i) => <button key={`${app.id}-${i}`} type="button" onClick={() => add({ ...action, logo: action.logo ?? app.logo })} disabled={graph.nodes.length >= 20} aria-label={`Add ${action.label} from ${app.name}`}><span>{action.label}<small>{labels[action.kind]}</small></span><b aria-hidden="true">+</b></button>)}</div>
        </details>)}
      </aside>
    </div>
  </section>;
}

const styles = String.raw`
.wb-root{--wb-bg:var(--color-background,Canvas);--wb-fg:var(--color-foreground,CanvasText);--wb-card:var(--color-card,Canvas);--wb-muted:var(--color-muted-foreground,GrayText);--wb-border:var(--color-border,GrayText);--wb-primary:var(--color-primary,Highlight);--wb-on-primary:var(--color-primary-foreground,HighlightText);--wb-secondary:var(--color-chart-2,var(--wb-primary));width:100%;min-width:0;border:1px solid var(--wb-border);border-radius:16px;overflow:hidden;background:var(--wb-bg);color:var(--wb-fg);font-size:14px;line-height:1.5;font-family:inherit;container-type:inline-size;box-sizing:border-box;text-align:left;isolation:isolate}
.wb-root *{box-sizing:border-box}.wb-root button,.wb-root select{font:inherit;color:inherit}.wb-root button{cursor:pointer}.wb-root button:disabled{opacity:.45;cursor:not-allowed}.wb-root button,.wb-root select{border:1px solid var(--wb-border);border-radius:8px;background:var(--wb-card);min-height:40px;padding:8px 12px}.wb-root button:hover:enabled{background:color-mix(in srgb,var(--wb-primary) 12%,var(--wb-card))}.wb-root :is(button,select,summary):focus-visible{outline:3px solid var(--wb-primary);outline-offset:3px}.wb-root .wb-primary{background:var(--wb-primary);color:var(--wb-on-primary);border-color:var(--wb-primary)}.wb-root .wb-primary:hover{background:var(--wb-primary);filter:brightness(1.08)}
.wb-header{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--wb-border);background:var(--wb-card)}.wb-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--wb-primary);color:var(--wb-on-primary);font:26px/1 system-ui}.wb-heading{flex:1;min-width:0}.wb-heading h2{font-size:16px;line-height:1.25;font-weight:650;margin:0}.wb-heading>span{font:10px/1.7 ui-monospace,monospace;letter-spacing:.13em;text-transform:uppercase;color:var(--wb-muted)}.wb-header-actions{display:flex;gap:8px;font-size:12px}.wb-header-actions span{margin-left:8px}.wb-workspace{display:grid;grid-template-columns:minmax(0,1fr) 254px}.wb-canvas-column{min-width:0}.wb-canvas{position:relative;height:460px;background-image:radial-gradient(color-mix(in srgb,var(--wb-muted) 36%,transparent) 1px,transparent 1px),radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--wb-primary) 7%,transparent),transparent 68%);background-size:18px 18px,100% 100%}.wb-root .react-flow{background:transparent;--xy-attribution-background-color:var(--wb-card);--xy-edge-stroke:var(--wb-primary);--xy-connectionline-stroke:var(--wb-primary)}.wb-root .react-flow__attribution a{color:var(--wb-muted);background:var(--wb-card)}.wb-root .react-flow__node:focus-visible{outline:3px solid var(--wb-primary);outline-offset:7px;border-radius:18px}.wb-root .react-flow__node{background:none;border:none;padding:0}.wb-node{width:196px;min-height:166px;border:1px solid color-mix(in srgb,var(--wb-primary) 60%,var(--wb-border));border-radius:18px;background:var(--wb-card);box-shadow:0 14px 32px -20px color-mix(in srgb,var(--wb-fg) 30%,transparent);color:var(--wb-fg);position:relative}.wb-node[data-kind=agent],.wb-node[data-kind=review]{--wb-node-accent:var(--color-chart-3,var(--wb-primary))}.wb-node[data-kind=integration]{--wb-node-accent:var(--color-chart-2,var(--wb-primary))}.wb-node[data-selected=true]{outline:2px solid var(--wb-primary);outline-offset:4px}.wb-node-head{padding:15px 13px 12px;display:flex;gap:10px;align-items:center}.wb-node-head strong{font-size:14px;line-height:1.2;display:block;font-weight:650;overflow-wrap:anywhere}.wb-node-head small{font:9px/1.5 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--wb-muted);display:block;margin-top:5px}.wb-glyph{display:grid;place-items:center;flex:0 0 36px;height:36px;border:1px solid var(--wb-border);border-radius:10px;background:color-mix(in srgb,var(--wb-primary) 10%,var(--wb-card));color:var(--wb-node-accent,var(--wb-primary))}.wb-glyph svg{width:21px;height:21px}.wb-node-body{padding:10px 13px 12px;border-top:1px solid var(--wb-border)}.wb-node-body p{font-size:12px;line-height:1.5;color:var(--wb-muted);margin:0 0 9px;overflow-wrap:anywhere}.wb-node-body>span{display:inline-block;border:1px solid var(--wb-border);border-radius:5px;padding:2px 6px;color:var(--wb-muted);font:9px/1.5 ui-monospace,monospace;text-transform:uppercase}.wb-root .react-flow__handle{width:12px;height:12px;min-width:12px;min-height:12px;border:2px solid var(--wb-card);background:var(--wb-node-accent,var(--wb-primary))}.wb-root .react-flow__handle:hover{outline:3px solid color-mix(in srgb,var(--wb-primary) 30%,transparent)}.wb-edge-halo{fill:none;stroke:color-mix(in srgb,var(--wb-primary) 13%,transparent);stroke-width:9}.wb-edge{fill:none;stroke-width:2.5}.wb-edge-pulse{fill:none;stroke:var(--wb-fg);stroke-opacity:.45;stroke-width:2;stroke-dasharray:3 45;animation:wb-travel 6s linear infinite}.wb-port{fill:var(--wb-primary)}@keyframes wb-travel{to{stroke-dashoffset:-192}}.wb-root[data-animated=false] .wb-edge-pulse{animation:none}.wb-root .react-flow__edge.selected .wb-edge{stroke-width:5}.wb-root .react-flow__edge:focus-visible{outline:none}.wb-root .react-flow__edge:focus-visible .wb-edge{stroke-width:5;filter:drop-shadow(0 0 3px var(--wb-primary))}.wb-empty{position:absolute;inset:40% 20px auto;text-align:center;color:var(--wb-muted);pointer-events:none}.wb-tools{position:absolute;left:16px;bottom:16px;display:flex;gap:3px;padding:4px;border:1px solid var(--wb-border);border-radius:10px;background:var(--wb-card)}.wb-tools button{border:0;min-width:36px;padding:6px 9px;font-size:12px}.wb-status{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--wb-border);padding:11px 18px;color:var(--wb-muted);font:10px/1.5 ui-monospace,monospace}.wb-status i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--wb-primary);margin-right:5px}.wb-editor{padding:18px;border-top:1px solid var(--wb-border);background:var(--wb-card);font-size:12px}.wb-edit-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wb-edit-row>label{color:var(--wb-muted)}.wb-edit-row select{flex:1;min-width:120px;max-width:100%}.wb-connect{display:flex;gap:10px;align-items:end;margin-top:14px}.wb-connect label{flex:1;min-width:0;color:var(--wb-muted);display:grid;gap:5px}.wb-connect select{width:100%;min-width:0;color:var(--wb-fg)}.wb-connect>span{align-self:center;padding-top:19px;color:var(--wb-muted)}.wb-connect button{white-space:nowrap}.wb-details{margin-top:16px}.wb-details summary{cursor:pointer;color:var(--wb-muted);padding:6px 0}.wb-details p{line-height:1.7;max-width:65ch;color:var(--wb-muted)}.wb-details ul{list-style:none;padding:0;margin:8px 0}.wb-details li{display:flex;justify-content:space-between;gap:12px;align-items:center;border-top:1px solid var(--wb-border);padding:7px 0}.wb-details li span{overflow-wrap:anywhere}.wb-details li button{font-size:11px;padding:5px 9px}.wb-message{margin:14px 0 7px;min-height:1.5em;color:var(--wb-fg)}.wb-root .wb-reset{border:0;background:none;text-decoration:underline;color:var(--wb-muted);padding:6px 0;font-size:11px}.wb-stack{border-left:1px solid var(--wb-border);background:color-mix(in srgb,var(--wb-card) 95%,var(--wb-primary));padding:20px 15px;min-width:0}.wb-stack-heading{display:flex;align-items:center;justify-content:space-between}.wb-stack h3{font-size:14px;letter-spacing:-.01em;margin:0;font-weight:650}.wb-stack-heading>span{color:var(--wb-muted);font-size:24px;line-height:1}.wb-stack>p{font-size:11px;line-height:1.6;color:var(--wb-muted);margin:8px 0 19px}.wb-app{border:1px solid var(--wb-border);border-radius:11px;background:var(--wb-card);margin-top:9px;overflow:hidden}.wb-app summary{list-style:none;display:flex;gap:9px;align-items:center;padding:12px;cursor:pointer}.wb-app summary::-webkit-details-marker{display:none}.wb-app summary:after{content:'+';margin-left:auto;color:var(--wb-muted)}.wb-app[open] summary:after{content:'−'}.wb-app summary strong{font-size:12px;font-weight:600}.wb-app summary small{font:10px ui-monospace,monospace;color:var(--wb-muted)}.wb-app-mark{display:grid;place-items:center;width:27px;height:27px;border-radius:7px;border:1px solid var(--wb-border);color:var(--wb-primary);font-size:13px;font-weight:700}.wb-actions{border-top:1px solid var(--wb-border);padding:6px}.wb-actions button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-size:11px;border:0;border-radius:6px;padding:9px;background:none}.wb-actions button>span{flex:1}.wb-actions small{display:block;font:8px/1.7 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.09em;color:var(--wb-muted);margin-top:3px}.wb-actions b{font-size:16px;font-weight:400;color:var(--wb-primary)}
.wb-header-actions{flex-wrap:wrap}.wb-node{border-color:color-mix(in srgb,var(--wb-node-accent,var(--wb-primary)) 68%,var(--wb-border));box-shadow:0 14px 32px -20px color-mix(in srgb,var(--wb-fg) 32%,transparent),0 0 26px -21px var(--wb-node-accent,var(--wb-primary))}.wb-node[data-kind=agent]{--wb-node-accent:var(--color-chart-2,var(--wb-primary))}.wb-node[data-kind=integration],.wb-node[data-kind=review]{--wb-node-accent:var(--color-chart-3,var(--wb-primary))}.wb-glyph img{width:23px;height:23px;object-fit:contain}.wb-app-mark img{width:18px;height:18px;object-fit:contain}.wb-step-form{display:grid;gap:12px;margin-top:14px;padding:14px;border:1px solid var(--wb-border);border-radius:10px;background:var(--wb-bg)}.wb-step-form label{display:grid;gap:5px;color:var(--wb-muted)}.wb-step-form input,.wb-step-form textarea{width:100%;min-width:0;min-height:40px;padding:9px 10px;border:1px solid var(--wb-border);border-radius:8px;background:var(--wb-card);color:var(--wb-fg);font:inherit;resize:vertical}.wb-step-form :is(input,textarea):focus-visible{outline:3px solid var(--wb-primary);outline-offset:2px}.wb-step-form>div{display:flex;gap:8px;flex-wrap:wrap}
@container(max-width:1050px){.wb-workspace{grid-template-columns:1fr}.wb-stack{border-left:0;border-top:1px solid var(--wb-border);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:start}.wb-stack-heading,.wb-stack>p{grid-column:1/-1}.wb-stack>p{margin:0}.wb-app{margin:0}.wb-canvas{height:410px}}
@container(max-width:480px){.wb-header{padding:14px;flex-wrap:wrap}.wb-header-actions{width:100%;justify-content:flex-end}.wb-header-actions button{flex:1}.wb-canvas{height:360px}.wb-status{flex-wrap:wrap;padding:10px 14px;gap:4px}.wb-editor{padding:14px}.wb-edit-row{display:grid;grid-template-columns:1fr}.wb-edit-row select{width:100%}.wb-connect{flex-wrap:wrap}.wb-connect label{flex:1 1 40%}.wb-connect>span{display:none}.wb-connect button{width:100%}.wb-stack{grid-template-columns:1fr}.wb-stack-heading,.wb-stack>p{grid-column:auto}.wb-details li{align-items:start}.wb-heading h2{font-size:15px}}
.wb-root .react-flow__pane,.wb-root .react-flow__node,.wb-root .react-flow__renderer{touch-action:none}
@media(prefers-reduced-motion:reduce){.wb-root .wb-edge-pulse{animation:none}}
`;
