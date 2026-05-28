"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle
} from "lucide-react";
import {
  dashboardMetrics,
  flowEdges,
  flowNodes,
  lifecycleSteps,
  notes,
  scenarios
} from "@/data/mockData";
import type { Decision, Scenario } from "@/data/types";

const decisionStyles: Record<
  Decision,
  {
    label: string;
    badge: string;
    node: string;
    edge: string;
    Icon: typeof CheckCircle2;
  }
> = {
  Approve: {
    label: "Approve",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    node: "border-emerald-500 bg-emerald-50",
    edge: "#10B981",
    Icon: CheckCircle2
  },
  "Step-Up Auth": {
    label: "Step-Up Auth",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    node: "border-amber-500 bg-amber-50",
    edge: "#F59E0B",
    Icon: AlertTriangle
  },
  Decline: {
    label: "Decline",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    node: "border-rose-500 bg-rose-50",
    edge: "#EF4444",
    Icon: XCircle
  }
};

function FlowNode({ data }: { data: { title: string; subtitle: string; active?: boolean; decision?: Decision } }) {
  const decision = data.decision ? decisionStyles[data.decision] : null;

  return (
    <div
      className={[
        "relative w-44 rounded-md border bg-white px-3 py-3 shadow-sm transition-all duration-300",
        data.active && decision ? decision.node : "border-axp-line"
      ].join(" ")}
    >
      <Handle id="left-target" type="target" position={Position.Left} />
      <Handle id="left-source" type="source" position={Position.Left} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="right-source" type="source" position={Position.Right} />
      <div className="text-sm font-semibold text-axp-ink">{data.title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{data.subtitle}</div>
    </div>
  );
}

const nodeTypes = { frameworkNode: FlowNode };

function buildScenarioNodes(activeScenario: Scenario): Node[] {
  return flowNodes.map((node) => {
    const active = activeScenario.highlightedNodeIds.includes(node.id);
    return {
      ...node,
      data: {
        ...node.data,
        active,
        decision: active ? activeScenario.decision : undefined
      }
    };
  });
}

function buildScenarioEdges(activeScenario: Scenario): Edge[] {
  return flowEdges.map((edge) => {
    const active = activeScenario.highlightedEdgeIds.includes(edge.id);
    return {
      ...edge,
      animated: active,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: active ? decisionStyles[activeScenario.decision].edge : "#8CA0B3"
      },
      style: {
        stroke: active ? decisionStyles[activeScenario.decision].edge : "#8CA0B3",
        strokeWidth: active ? 3 : 1.5
      }
    };
  });
}

function ScenarioButton({
  scenario,
  selected,
  onSelect
}: {
  scenario: Scenario;
  selected: boolean;
  onSelect: () => void;
}) {
  const { Icon } = decisionStyles[scenario.decision];

  return (
    <button
      onClick={onSelect}
      className={[
        "w-full rounded-md border px-4 py-3 text-left transition hover:border-axp-blue hover:bg-white",
        selected ? "border-axp-blue bg-white shadow-sm" : "border-axp-line bg-slate-50"
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-axp-blue" aria-hidden="true" />
        <div>
          <div className="text-sm font-semibold text-axp-ink">{scenario.name}</div>
          <div className="mt-1 text-xs text-slate-600">{scenario.shortDescription}</div>
        </div>
      </div>
    </button>
  );
}

function DecisionPanel({ scenario }: { scenario: Scenario }) {
  const style = decisionStyles[scenario.decision];
  const Icon = style.Icon;

  return (
    <section className="rounded-md border border-axp-line bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-axp-ink">Decision Engine</h2>
          <p className="mt-1 text-sm text-slate-600">Deterministic outcome for the selected scenario.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${style.badge}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {style.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Risk score" value={`${scenario.riskScore}/100`} />
        <Metric label="Friction" value={scenario.customerFriction} />
        <Metric label="Auth outcome" value={scenario.authenticationOutcome} />
        <Metric label="Control posture" value={scenario.controlPosture} />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-axp-ink">Reason Codes</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {scenario.reasonCodes.map((reason) => (
            <span key={reason} className="rounded-full bg-axp-mist px-3 py-1 text-xs font-medium text-slate-700">
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-axp-ink">Triggered KRIs</h3>
        <ul className="mt-2 space-y-2">
          {scenario.triggeredKris.map((kri) => (
            <li key={kri} className="flex items-center gap-2 text-sm text-slate-700">
              <Gauge className="h-4 w-4 text-axp-blue" aria-hidden="true" />
              {kri}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-axp-line bg-slate-50 p-3">
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-axp-ink">{value}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <section className="rounded-md border border-axp-line bg-white p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-axp-blue" aria-hidden="true" />
        <h2 className="text-base font-semibold text-axp-ink">KPI / KRI Dashboard</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-axp-line bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">{metric.label}</span>
              <span className="text-sm font-semibold text-axp-ink">{metric.value}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white">
              <div className="h-1.5 rounded-full bg-axp-blue" style={{ width: `${metric.displayPercent}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">{metric.type}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NotesPanel() {
  return (
    <section className="rounded-md border border-axp-line bg-white p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-5 w-5 text-axp-blue" aria-hidden="true" />
        <h2 className="text-base font-semibold text-axp-ink">Narration Notes</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {notes.map((note) => (
          <div key={note.title} className="rounded-md border border-axp-line bg-slate-50 p-3">
            <div className="text-sm font-semibold text-axp-ink">{note.title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const activeScenario = scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0];
  const nodes = useMemo(() => buildScenarioNodes(activeScenario), [activeScenario]);
  const edges = useMemo(() => buildScenarioEdges(activeScenario), [activeScenario]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-axp-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase text-axp-blue">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              Agentic Commerce Fraud Risk Framework
            </div>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-axp-ink lg:text-4xl">
              Trust orchestration from delegated authority to explainable payment decisioning.
            </h1>
          </div>
          <div className="max-w-md text-sm leading-6 text-slate-600">
            Built for a three-minute walkthrough: lifecycle first, scenario second, controls and tradeoffs always visible.
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="rounded-md border border-axp-line bg-white shadow-panel">
            <div className="flex flex-col gap-3 border-b border-axp-line p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-axp-ink">Trust Lifecycle Flow</h2>
                <p className="mt-1 text-sm text-slate-600">
                  User to agent registration, delegated permissions, intent, risk decision, monitoring, and feedback.
                </p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ring-1 ${decisionStyles[activeScenario.decision].badge}`}>
                Active path: {activeScenario.decision}
              </span>
            </div>
            <div className="h-[560px]">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.18 }}
                  minZoom={0.55}
                  maxZoom={1.4}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                >
                  <Background color="#D8E2EA" gap={22} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <section className="rounded-md border border-axp-line bg-white p-5 shadow-panel">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-axp-blue" aria-hidden="true" />
                <h2 className="text-base font-semibold text-axp-ink">Scenario Simulator</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Select a scenario to highlight the lifecycle path and show why the decision changes.
              </p>
              <div className="mt-4 space-y-3">
                {scenarios.map((scenario) => (
                  <ScenarioButton
                    key={scenario.id}
                    scenario={scenario}
                    selected={scenario.id === scenarioId}
                    onSelect={() => setScenarioId(scenario.id)}
                  />
                ))}
              </div>
            </section>

            <DecisionPanel scenario={activeScenario} />
          </aside>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-md border border-axp-line bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-axp-ink">Lifecycle Talking Points</h2>
            <div className="mt-4 grid gap-3">
              {lifecycleSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-md border border-axp-line bg-slate-50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-axp-blue text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-axp-ink">{step.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="grid gap-5">
            <Dashboard />
            <NotesPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
