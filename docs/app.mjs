import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider
} from "@xyflow/react";

const h = React.createElement;

const defaultLifecycleNodeIds = [
  "user",
  "registration",
  "permissions",
  "intent",
  "transaction",
  "risk",
  "decision",
  "monitoring",
  "dashboard"
];

const EVALUATION_STEP_MS = 900;

const scenarios = [
  {
    id: "low-risk",
    name: "Scenario 1: Low Risk",
    shortDescription: "Trusted agent, repeat merchant, normal spend, consistent device.",
    decision: "Approve",
    riskScore: 18,
    customerFriction: "Low",
    authenticationOutcome: "No step-up required",
    controlPosture: "Progressive trust",
    reasonCodes: ["Trusted registered agent", "Repeat merchant pattern", "Normal spend range", "Consistent device context"],
    triggeredKris: ["No material KRI triggered"],
    narrative: "Signals remain inside the delegated trust envelope, so the system preserves the customer experience.",
    transaction: {
      agent: "Registered shopping agent, 8-month history",
      permission: "$250 cap, home goods allowed",
      intent: "Matches authenticated purchase intent",
      merchant: "Repeat merchant",
      amount: "$82.40, normal range",
      credential: "Stable device and payment token"
    },
    signals: [
      ["Agent trust", "Established", 12],
      ["Delegated authority", "Within limit", 8],
      ["Intent match", "High confidence", 10],
      ["Merchant exposure", "Known", 6],
      ["Velocity", "Normal", 4]
    ],
    controls: ["Permit silent authorization", "Log decision reason codes", "Feed outcome into monitoring"],
    highlightedNodeIds: defaultLifecycleNodeIds,
    highlightedEdgeIds: []
  },
  {
    id: "medium-risk",
    name: "Scenario 2: Medium Risk",
    shortDescription: "New merchant, higher amount, unusual purchase timing.",
    decision: "Step-Up Auth",
    riskScore: 57,
    customerFriction: "Moderate",
    authenticationOutcome: "User approval requested before authorization",
    controlPosture: "Selective friction",
    reasonCodes: ["New merchant exposure", "Higher than normal amount", "Unusual purchase timing", "Intent confidence requires confirmation"],
    triggeredKris: ["New merchant exposure", "Purchase timing variance"],
    narrative: "The transaction is plausible but not fully consistent, so the control is selective confirmation rather than immediate decline.",
    transaction: {
      agent: "Registered agent, limited tenure",
      permission: "$500 cap, general retail allowed",
      intent: "Intent present but merchant context is new",
      merchant: "First-time merchant",
      amount: "$286.10, elevated for profile",
      credential: "Known token, unusual purchase hour"
    },
    signals: [
      ["Agent trust", "Registered", 18],
      ["Delegated authority", "Within limit", 12],
      ["Intent match", "Partial confidence", 34],
      ["Merchant exposure", "New merchant", 42],
      ["Timing", "Unusual", 28]
    ],
    controls: ["Pause authorization", "Ask customer to confirm purchase intent", "Approve only if step-up succeeds"],
    highlightedNodeIds: defaultLifecycleNodeIds,
    highlightedEdgeIds: []
  },
  {
    id: "high-risk",
    name: "Scenario 3: High Risk",
    shortDescription: "Permission escalation, token inconsistency, velocity anomaly, intent mismatch.",
    decision: "Decline",
    riskScore: 89,
    customerFriction: "High",
    authenticationOutcome: "Authorization declined and routed to monitoring",
    controlPosture: "Protective stop",
    reasonCodes: ["Delegated limit exceeded", "Permission escalation event", "Token inconsistency", "Velocity anomaly detected", "Intent mismatch"],
    triggeredKris: ["Permission escalation events", "Token refresh anomalies", "Velocity spike alert", "Intent mismatch rate"],
    narrative: "Multiple controls point to delegated authority abuse, so the framework favors loss avoidance over additional customer friction.",
    transaction: {
      agent: "Agent requests broader permission mid-session",
      permission: "Attempted category and spend escalation",
      intent: "Cart no longer matches captured intent",
      merchant: "Unfamiliar merchant cluster",
      amount: "$1,140.00, above delegated cap",
      credential: "Token refresh inconsistency"
    },
    signals: [
      ["Permission escalation", "Triggered", 86],
      ["Token consistency", "Anomalous", 72],
      ["Intent match", "Mismatch", 90],
      ["Velocity", "Spike", 78],
      ["Merchant exposure", "Unfamiliar", 61]
    ],
    controls: ["Decline authorization", "Freeze expanded agent permissions", "Route event to monitoring and KRI dashboard"],
    highlightedNodeIds: defaultLifecycleNodeIds,
    highlightedEdgeIds: []
  }
];

const dashboardMetrics = [
  ["Fraud loss rate", "0.08%", 8, "KPI"],
  ["Approval rate", "94.2%", 94, "KPI"],
  ["False positive rate", "1.7%", 17, "KPI"],
  ["Agentic transaction success", "91.4%", 91, "KPI"],
  ["Customer override rate", "3.1%", 31, "KPI"],
  ["Agent drift alerts", "12", 38, "KRI"],
  ["Velocity spike alerts", "7", 28, "KRI"],
  ["Token refresh anomalies", "5", 20, "KRI"],
  ["Permission escalation events", "4", 16, "KRI"],
  ["Intent mismatch rate", "2.4%", 24, "KRI"]
];

const lifecycleSteps = [
  ["Trust starts before the transaction", "Registration and account enablement establish whether the agent is known, bound to the customer, and allowed to act."],
  ["Delegation narrows what the agent can do", "Permissions translate customer authority into practical controls such as spend limits, merchant scope, and approval requirements."],
  ["Intent validation connects why to what", "The system compares authenticated purchase intent with cart context, timing, merchant, credential, and behavior signals."],
  ["Decisioning balances fraud and friction", "Low risk can pass cleanly, medium risk gets selective step-up, and high risk is stopped with explainable reason codes."],
  ["Closed-loop visibility improves control health", "Monitoring tracks outcomes, overrides, drift, and KRIs so controls can adapt without turning every purchase into a hard stop."]
];

const notes = [
  ["Why risk changes", "Agentic commerce inserts a delegated actor between customer intent and payment execution, so the risk question becomes whether the agent is acting within trusted authority."],
  ["Why intent matters", "A valid credential is not enough. The system needs confidence that the cart, merchant, timing, and amount still match authenticated customer intent."],
  ["Why visibility matters", "Closed-loop signals help distinguish normal automation from agent drift, token anomalies, permission misuse, or emerging abuse patterns."],
  ["Customer experience tradeoff", "The framework avoids blanket friction: approve trusted behavior, step up when uncertainty is manageable, and decline when delegated authority appears abused."]
];

const decisionClasses = {
  Approve: { className: "approve", color: "#10B981" },
  "Step-Up Auth": { className: "step", color: "#F59E0B" },
  Decline: { className: "decline", color: "#EF4444" }
};

function buildScenarioGraph(scenario) {
  if (scenario.id === "medium-risk") {
    const sequence = ["user", "registration", "permissions", "intent", "transaction", "risk", "stepup", "confirmation", "monitoring", "dashboard"];
    return {
      summary: "Selective-friction path: uncertainty is resolved through customer confirmation before authorization.",
      nodes: [
        node("user", 0, 160, "User", "Human identity anchors the delegated action.", "core", 0),
        node("registration", 185, 55, "Registered Agent", "Known agent, but limited tenure.", "core", 1),
        node("permissions", 370, 55, "Delegated Envelope", "$500 retail cap; step-up allowed.", "core", 2),
        node("intent", 555, 55, "Intent Capture", "Intent exists, but merchant context is not familiar.", "core", 3),
        node("transaction", 740, 55, "Transaction Request", "$286.10 at a first-time merchant.", "core", 4),
        node("merchant-signal", 370, 205, "Merchant Exposure", "New merchant raises uncertainty, not automatic fraud.", "signal", 5),
        node("timing-signal", 555, 205, "Timing Variance", "Purchase occurs outside normal pattern.", "signal", 5),
        node("risk", 740, 205, "Risk Engine", "Aggregates intent, merchant, amount, and timing signals.", "risk", 5),
        node("stepup", 555, 355, "Step-Up Auth", "Ask customer to confirm the purchase intent.", "terminal", 6),
        node("confirmation", 370, 355, "Human Confirmation", "Resume only after positive confirmation.", "control", 7),
        node("monitoring", 185, 355, "Monitoring Loop", "Track approval, abandonment, and override rate.", "control", 8),
        node("dashboard", 0, 355, "KPI / KRI Dashboard", "Friction and new-merchant exposure updated.", "control", 9)
      ],
      edges: [
        edge("user-registration", "user", "registration", "right-source", "left-target"),
        edge("registration-permissions", "registration", "permissions", "right-source", "left-target"),
        edge("permissions-intent", "permissions", "intent", "right-source", "left-target"),
        edge("intent-transaction", "intent", "transaction", "right-source", "left-target"),
        edge("transaction-risk", "transaction", "risk", "bottom-source", "top-target"),
        edge("merchant-risk", "merchant-signal", "risk", "right-source", "left-target", "merchant evidence"),
        edge("timing-risk", "timing-signal", "risk", "right-source", "left-target", "timing evidence"),
        edge("risk-stepup", "risk", "stepup", "left-source", "right-target"),
        edge("stepup-confirmation", "stepup", "confirmation", "left-source", "right-target"),
        edge("confirmation-monitoring", "confirmation", "monitoring", "left-source", "right-target"),
        edge("monitoring-dashboard", "monitoring", "dashboard", "left-source", "right-target")
      ],
      sequence,
      edgeSequence: [
        "user-registration",
        "registration-permissions",
        "permissions-intent",
        "intent-transaction",
        "transaction-risk",
        "merchant-risk",
        "timing-risk",
        "risk-stepup",
        "stepup-confirmation",
        "confirmation-monitoring",
        "monitoring-dashboard"
      ]
    };
  }

  if (scenario.id === "high-risk") {
    const sequence = ["user", "registration", "permissions", "intent", "transaction", "risk", "decline", "containment", "monitoring", "dashboard"];
    return {
      summary: "Protective-stop path: delegated-authority abuse indicators change the graph into decline, containment, and KRI escalation.",
      nodes: [
        node("user", 0, 160, "User", "Human account is protected from out-of-scope agent action.", "core", 0),
        node("registration", 185, 55, "Agent Session", "Agent is known, but current behavior shifts.", "core", 1),
        node("permissions", 370, 55, "Permission Boundary", "Category and spend expansion requested mid-session.", "core", 2),
        node("intent", 555, 55, "Intent Capture", "Cart no longer matches authenticated intent.", "core", 3),
        node("transaction", 740, 55, "Transaction Request", "$1,140 at unfamiliar merchant cluster.", "core", 4),
        node("token-signal", 370, 205, "Token Inconsistency", "Credential refresh does not match expected pattern.", "signal", 5),
        node("velocity-signal", 555, 205, "Velocity Spike", "Multiple rapid attempts after permission change.", "signal", 5),
        node("risk", 740, 205, "Risk Engine", "Permission, token, velocity, and intent all point upward.", "risk", 5),
        node("decline", 555, 355, "Decline Authorization", "Stop payment before submission.", "terminal", 6),
        node("containment", 370, 355, "Containment Control", "Freeze expanded permissions; keep baseline account access.", "control", 7),
        node("monitoring", 185, 355, "Monitoring Loop", "Route to review queue with reason codes.", "control", 8),
        node("dashboard", 0, 355, "KRI Dashboard", "Permission escalation and intent mismatch updated.", "control", 9)
      ],
      edges: [
        edge("user-registration", "user", "registration", "right-source", "left-target"),
        edge("registration-permissions", "registration", "permissions", "right-source", "left-target"),
        edge("permissions-intent", "permissions", "intent", "right-source", "left-target"),
        edge("intent-transaction", "intent", "transaction", "right-source", "left-target"),
        edge("transaction-risk", "transaction", "risk", "bottom-source", "top-target"),
        edge("token-risk", "token-signal", "risk", "right-source", "left-target", "token evidence"),
        edge("velocity-risk", "velocity-signal", "risk", "right-source", "left-target", "velocity evidence"),
        edge("risk-decline", "risk", "decline", "left-source", "right-target"),
        edge("decline-containment", "decline", "containment", "left-source", "right-target"),
        edge("containment-monitoring", "containment", "monitoring", "left-source", "right-target"),
        edge("monitoring-dashboard", "monitoring", "dashboard", "left-source", "right-target")
      ],
      sequence,
      edgeSequence: [
        "user-registration",
        "registration-permissions",
        "permissions-intent",
        "intent-transaction",
        "transaction-risk",
        "token-risk",
        "velocity-risk",
        "risk-decline",
        "decline-containment",
        "containment-monitoring",
        "monitoring-dashboard"
      ]
    };
  }

  const sequence = ["user", "registration", "permissions", "intent", "transaction", "risk", "approve", "monitoring", "dashboard"];
  return {
    summary: "Low-friction path: strong trust and intent evidence allow approval without interrupting the customer.",
    nodes: [
      node("user", 0, 160, "User", "Human identity and account relationship.", "core", 0),
      node("registration", 185, 55, "Registered Agent", "Device-bound agent with prior successful purchases.", "core", 1),
      node("permissions", 370, 55, "Delegated Envelope", "$250 cap, home goods scope, no step-up required.", "core", 2),
      node("intent", 555, 55, "Intent Capture", "Authenticated request for replacement filters.", "core", 3),
      node("transaction", 740, 55, "Transaction Request", "$82.40 at repeat merchant.", "core", 4),
      node("trust-signal", 370, 205, "Trust Evidence", "Repeat merchant, normal amount, consistent device.", "signal", 5),
      node("cart-signal", 555, 205, "Cart Context", "Cart matches captured purchase intent.", "signal", 5),
      node("risk", 740, 205, "Risk Engine", "Signals remain inside the delegated trust envelope.", "risk", 5),
      node("approve", 555, 355, "Approve", "Silent authorization; no customer interruption.", "terminal", 6),
      node("monitoring", 370, 355, "Monitoring Loop", "Outcome logged for closed-loop trust calibration.", "control", 7),
      node("dashboard", 185, 355, "KPI / KRI Dashboard", "Approval success and low friction updated.", "control", 8)
    ],
    edges: [
      edge("user-registration", "user", "registration", "right-source", "left-target"),
      edge("registration-permissions", "registration", "permissions", "right-source", "left-target"),
      edge("permissions-intent", "permissions", "intent", "right-source", "left-target"),
      edge("intent-transaction", "intent", "transaction", "right-source", "left-target"),
      edge("transaction-risk", "transaction", "risk", "bottom-source", "top-target"),
      edge("trust-risk", "trust-signal", "risk", "right-source", "left-target", "trust evidence"),
      edge("cart-risk", "cart-signal", "risk", "right-source", "left-target", "intent evidence"),
      edge("risk-approve", "risk", "approve", "left-source", "right-target"),
      edge("approve-monitoring", "approve", "monitoring", "left-source", "right-target"),
      edge("monitoring-dashboard", "monitoring", "dashboard", "left-source", "right-target")
    ],
    sequence,
    edgeSequence: [
      "user-registration",
      "registration-permissions",
      "permissions-intent",
      "intent-transaction",
      "transaction-risk",
      "trust-risk",
      "cart-risk",
      "risk-approve",
      "approve-monitoring",
      "monitoring-dashboard"
    ]
  };
}

function node(id, x, y, title, subtitle, kind = "core", stage = 0) {
  return { id, type: "frameworkNode", position: { x, y }, data: { title, subtitle, kind, stage } };
}

function edge(id, source, target, sourceHandle, targetHandle, label = undefined) {
  return { id, source, target, sourceHandle, targetHandle, label };
}

function FrameworkNode({ data }) {
  const activeClass = data.active && data.decision ? decisionClasses[data.decision].className : "";
  return h(
    "div",
    { className: `flow-node ${data.kind} ${activeClass} ${data.status}` },
    h(Handle, { id: "left-target", type: "target", position: Position.Left }),
    h(Handle, { id: "left-source", type: "source", position: Position.Left }),
    h(Handle, { id: "right-target", type: "target", position: Position.Right }),
    h(Handle, { id: "right-source", type: "source", position: Position.Right }),
    h(Handle, { id: "top-target", type: "target", position: Position.Top }),
    h(Handle, { id: "top-source", type: "source", position: Position.Top }),
    h(Handle, { id: "bottom-target", type: "target", position: Position.Bottom }),
    h(Handle, { id: "bottom-source", type: "source", position: Position.Bottom }),
    h("div", { className: "node-kicker" }, data.status === "current" ? "Evaluating" : data.status === "done" ? "Validated" : "Pending"),
    h("div", { className: "node-title" }, data.title),
    h("div", { className: "node-subtitle" }, data.subtitle)
  );
}

function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const activeScenario = scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0];
  const activeDecision = decisionClasses[activeScenario.decision];
  const scenarioGraph = useMemo(() => buildScenarioGraph(activeScenario), [activeScenario]);
  const [stepIndex, setStepIndex] = useState(scenarioGraph.sequence.length - 1);
  const visibleEdgeIds = useMemo(() => {
    return scenarioGraph.edgeSequence.slice(0, Math.max(0, stepIndex + 2));
  }, [scenarioGraph.edgeSequence, stepIndex]);

  useEffect(() => {
    setStepIndex(0);
    const timer = setInterval(() => {
      setStepIndex((current) => {
        if (current >= scenarioGraph.sequence.length - 1) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, EVALUATION_STEP_MS);
    return () => clearInterval(timer);
  }, [scenarioId, scenarioGraph.sequence.length]);

  const nodes = useMemo(() => {
    return scenarioGraph.nodes.map((item) => {
      const stage = item.data.stage ?? scenarioGraph.sequence.indexOf(item.id);
      return {
      ...item,
      data: {
        ...item.data,
        active: stage <= stepIndex,
        decision: activeScenario.decision,
        status:
          stage < stepIndex
            ? "done"
            : stage === stepIndex
              ? "current"
              : "pending"
      }
    };
    });
  }, [activeScenario.decision, scenarioGraph.nodes, scenarioGraph.sequence, stepIndex]);

  const edges = useMemo(() => {
    return scenarioGraph.edges.map((item) => {
      const active = visibleEdgeIds.includes(item.id);
      const color = active ? activeDecision.color : "#8CA0B3";
      return {
        ...item,
        animated: active,
        markerEnd: { type: MarkerType.ArrowClosed, color },
        style: { stroke: color, strokeWidth: active ? 3 : 1.5 }
      };
    });
  }, [activeDecision.color, scenarioGraph.edges, visibleEdgeIds]);

  return h(
    "main",
    { className: "page" },
    h(
      "header",
      { className: "topbar" },
      h("div", null, h("div", { className: "eyebrow" }, "Agentic Commerce Fraud Risk Framework"), h("h1", null, "Trust orchestration from delegated authority to explainable payment decisioning.")),
      h("div", { className: "top-copy" }, "Built for a three-minute walkthrough: lifecycle first, scenario second, controls and tradeoffs always visible.")
    ),
    h(
      "section",
      { className: "main-grid" },
      h(
        "div",
        { className: "panel" },
        h(
          "div",
          { className: "panel-header" },
          h("div", null, h("h2", null, "Scenario-Specific Trust Flow"), h("p", null, scenarioGraph.summary)),
          h(
            "span",
            { className: `badge ${activeDecision.className}` },
            stepIndex < scenarioGraph.sequence.length - 1 ? `Evaluating: ${scenarioGraph.nodes.find((item) => item.id === scenarioGraph.sequence[stepIndex])?.data.title}` : `Decision: ${activeScenario.decision}`
          )
        ),
        h(
          "div",
          { className: "flow-wrap" },
          h(
            ReactFlowProvider,
            null,
            h(
              ReactFlow,
              {
                nodes,
                edges,
                nodeTypes: { frameworkNode: FrameworkNode },
                fitView: true,
                fitViewOptions: { padding: 0.1 },
                minZoom: 0.32,
                maxZoom: 1.4,
                nodesDraggable: false,
                nodesConnectable: false,
                elementsSelectable: false
              },
              h(Background, { color: "#D8E2EA", gap: 22 }),
              h(Controls, { showInteractive: false })
            )
          )
        )
      ),
      h(
        "aside",
        { className: "stack" },
        h(
          "section",
          { className: "panel panel-pad" },
          h("h2", null, "Scenario Simulator"),
          h("p", null, "Select a scenario to highlight the lifecycle path and show why the decision changes."),
          h(
            "div",
            { className: "scenario-list" },
            scenarios.map((scenario) =>
              h(
                "button",
                {
                  key: scenario.id,
                  className: `scenario-button ${scenario.id === scenarioId ? "selected" : ""}`,
                  "data-scenario-id": scenario.id,
                  onClick: () => setScenarioId(scenario.id)
                },
                h("div", { className: "scenario-title" }, scenario.name),
                h("div", { className: "scenario-desc" }, scenario.shortDescription)
              )
            )
          )
        ),
        h(DecisionPanel, { scenario: activeScenario, stepIndex, sequenceLength: scenarioGraph.sequence.length })
      )
    ),
    h(
      "section",
      { className: "lower-grid" },
      h(LifecyclePanel),
      h("div", { className: "stack" }, h(Dashboard), h(NotesPanel))
    )
  );
}

function DecisionPanel({ scenario, stepIndex, sequenceLength }) {
  const decision = decisionClasses[scenario.decision];
  const complete = stepIndex >= sequenceLength - 1;
  return h(
    "section",
    { className: "panel panel-pad" },
    h(
      "div",
      { className: "panel-header", style: { padding: 0, borderBottom: 0 } },
      h("div", null, h("h2", null, "Decision Engine"), h("p", null, complete ? scenario.narrative : "Reading evidence across the lifecycle.")),
      h("span", { className: `badge ${decision.className}` }, complete ? scenario.decision : "Evaluating")
    ),
    h("div", { className: "score-block" }, h("div", { className: "score-top" }, h("span", null, "Risk score"), h("strong", null, `${scenario.riskScore}/100`)), h("div", { className: "score-rail" }, h("div", { className: `score-fill ${decision.className}`, style: { width: `${scenario.riskScore}%` } }))),
    h(SignalStack, { scenario }),
    h(
      "div",
      { className: "metrics-grid" },
      metric("Friction", scenario.customerFriction),
      metric("Auth outcome", scenario.authenticationOutcome),
      metric("Control posture", scenario.controlPosture),
      metric("Feedback", scenario.decision === "Decline" ? "KRI routed" : "Outcome logged")
    ),
    h(TransactionPacket, { scenario }),
    h(ControlTrail, { scenario }),
    h("h2", { style: { marginTop: 18, fontSize: 14 } }, "Reason Codes"),
    h("div", { className: "chips" }, scenario.reasonCodes.map((item) => h("span", { key: item, className: "chip" }, item))),
    h("h2", { style: { marginTop: 18, fontSize: 14 } }, "Triggered KRIs"),
    h("div", { className: "kri-list" }, scenario.triggeredKris.map((item) => h("div", { key: item, className: "kri-item" }, h("span", { className: "dot" }), item)))
  );
}

function TransactionPacket({ scenario }) {
  return h(
    "div",
    { className: "evidence-block" },
    h("h2", null, "Transaction Packet"),
    h(
      "div",
      { className: "packet-grid" },
      Object.entries(scenario.transaction).map(([label, value]) =>
        h("div", { key: label, className: "packet-row" }, h("span", null, label), h("strong", null, value))
      )
    )
  );
}

function SignalStack({ scenario }) {
  const decision = decisionClasses[scenario.decision];
  return h(
    "div",
    { className: "evidence-block" },
    h("h2", null, "Risk Signal Stack"),
    h(
      "div",
      { className: "signal-list" },
      scenario.signals.map(([label, status, value]) =>
        h(
          "div",
          { key: label, className: "signal-row" },
          h("div", { className: "signal-copy" }, h("strong", null, label), h("span", null, status)),
          h("div", { className: "signal-bar" }, h("div", { className: `signal-fill ${decision.className}`, style: { width: `${value}%` } }))
        )
      )
    )
  );
}

function ControlTrail({ scenario }) {
  return h(
    "div",
    { className: "evidence-block" },
    h("h2", null, "Control Response"),
    h(
      "div",
      { className: "control-trail" },
      scenario.controls.map((item, index) =>
        h("div", { key: item, className: "control-step" }, h("span", null, index + 1), h("strong", null, item))
      )
    )
  );
}

function metric(label, value) {
  return h("div", { key: label, className: "metric" }, h("div", { className: "metric-label" }, label), h("div", { className: "metric-value" }, value));
}

function LifecyclePanel() {
  return h(
    "section",
    { className: "panel panel-pad" },
    h("h2", null, "Lifecycle Talking Points"),
    h(
      "div",
      { className: "steps" },
      lifecycleSteps.map(([title, body], index) =>
        h(
          "div",
          { key: title, className: "step-card" },
          h("div", { className: "step-number" }, index + 1),
          h("div", null, h("div", { className: "card-title" }, title), h("p", null, body))
        )
      )
    )
  );
}

function Dashboard() {
  return h(
    "section",
    { className: "panel panel-pad" },
    h("h2", null, "KPI / KRI Dashboard"),
    h(
      "div",
      { className: "dashboard-grid" },
      dashboardMetrics.map(([label, value, percent, kind]) =>
        h(
          "div",
          { key: label, className: "small-card" },
          h("div", { className: "metric-row" }, h("strong", null, label), h("strong", null, value)),
          h("div", { className: "bar" }, h("div", { className: "bar-fill", style: { width: `${percent}%` } })),
          h("div", { className: "metric-kind" }, kind)
        )
      )
    )
  );
}

function NotesPanel() {
  return h(
    "section",
    { className: "panel panel-pad" },
    h("h2", null, "Narration Notes"),
    h(
      "div",
      { className: "notes-grid" },
      notes.map(([title, body]) =>
        h("div", { key: title, className: "small-card" }, h("div", { className: "card-title" }, title), h("p", null, body))
      )
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
