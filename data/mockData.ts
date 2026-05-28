import type { DashboardMetric, FlowEdge, FlowNode, Scenario } from "./types";

export const flowNodes: FlowNode[] = [
  {
    id: "user",
    type: "frameworkNode",
    position: { x: 0, y: 130 },
    data: {
      title: "User",
      subtitle: "Human identity and account relationship."
    }
  },
  {
    id: "registration",
    type: "frameworkNode",
    position: { x: 190, y: 50 },
    data: {
      title: "Agent Registration",
      subtitle: "Known agent, account enablement, device linkage."
    }
  },
  {
    id: "permissions",
    type: "frameworkNode",
    position: { x: 380, y: 50 },
    data: {
      title: "Delegated Permissions",
      subtitle: "Limits, merchant scope, approval boundaries."
    }
  },
  {
    id: "intent",
    type: "frameworkNode",
    position: { x: 570, y: 50 },
    data: {
      title: "Intent Capture",
      subtitle: "Authenticated intent, ambiguity risk, behavior, cart context."
    }
  },
  {
    id: "transaction",
    type: "frameworkNode",
    position: { x: 760, y: 130 },
    data: {
      title: "Transaction Request",
      subtitle: "Payment credential, merchant, amount, timing."
    }
  },
  {
    id: "risk",
    type: "frameworkNode",
    position: { x: 570, y: 260 },
    data: {
      title: "Risk Engine",
      subtitle: "Intent probability, velocity, token, behavioral consistency."
    }
  },
  {
    id: "decision",
    type: "frameworkNode",
    position: { x: 380, y: 260 },
    data: {
      title: "Decision Layer",
      subtitle: "Approve, step-up, or decline with reason codes."
    }
  },
  {
    id: "monitoring",
    type: "frameworkNode",
    position: { x: 190, y: 260 },
    data: {
      title: "Monitoring Loop",
      subtitle: "Closed-loop feedback, overrides, drift signals."
    }
  },
  {
    id: "dashboard",
    type: "frameworkNode",
    position: { x: 0, y: 260 },
    data: {
      title: "KPI / KRI Dashboard",
      subtitle: "Fraud, friction, trust, and control health."
    }
  }
];

export const flowEdges: FlowEdge[] = [
  { id: "user-registration", source: "user", sourceHandle: "right-source", target: "registration", targetHandle: "left-target" },
  { id: "registration-permissions", source: "registration", sourceHandle: "right-source", target: "permissions", targetHandle: "left-target" },
  { id: "permissions-intent", source: "permissions", sourceHandle: "right-source", target: "intent", targetHandle: "left-target" },
  { id: "intent-transaction", source: "intent", sourceHandle: "right-source", target: "transaction", targetHandle: "left-target" },
  { id: "transaction-risk", source: "transaction", sourceHandle: "left-source", target: "risk", targetHandle: "right-target" },
  { id: "risk-decision", source: "risk", sourceHandle: "left-source", target: "decision", targetHandle: "right-target" },
  { id: "decision-monitoring", source: "decision", sourceHandle: "left-source", target: "monitoring", targetHandle: "right-target" },
  { id: "monitoring-dashboard", source: "monitoring", sourceHandle: "left-source", target: "dashboard", targetHandle: "right-target" },
  {
    id: "monitoring-risk",
    source: "monitoring",
    sourceHandle: "right-source",
    target: "risk",
    targetHandle: "left-target",
    type: "smoothstep",
    label: "feedback"
  }
];

const fullLifecycleNodes = [
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

const fullLifecycleEdges = [
  "user-registration",
  "registration-permissions",
  "permissions-intent",
  "intent-transaction",
  "transaction-risk",
  "risk-decision",
  "decision-monitoring",
  "monitoring-dashboard"
];

export const scenarios: Scenario[] = [
  {
    id: "low-risk",
    name: "Scenario 1: Low Risk",
    shortDescription: "Trusted agent, repeat merchant, normal spend, consistent device.",
    decision: "Approve",
    riskScore: 18,
    customerFriction: "Low",
    authenticationOutcome: "No step-up required",
    controlPosture: "Progressive trust",
    reasonCodes: [
      "Trusted registered agent",
      "Repeat merchant pattern",
      "Normal spend range",
      "Consistent device context"
    ],
    triggeredKris: ["No material KRI triggered"],
    highlightedNodeIds: fullLifecycleNodes,
    highlightedEdgeIds: fullLifecycleEdges
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
    reasonCodes: [
      "New merchant exposure",
      "Higher than normal amount",
      "Unusual purchase timing",
      "Intent confidence requires confirmation"
    ],
    triggeredKris: ["New merchant exposure", "Purchase timing variance"],
    highlightedNodeIds: fullLifecycleNodes,
    highlightedEdgeIds: fullLifecycleEdges
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
    reasonCodes: [
      "Delegated limit exceeded",
      "Permission escalation event",
      "Token inconsistency",
      "Velocity anomaly detected",
      "Intent mismatch"
    ],
    triggeredKris: [
      "Permission escalation events",
      "Token refresh anomalies",
      "Velocity spike alert",
      "Intent mismatch rate"
    ],
    highlightedNodeIds: fullLifecycleNodes,
    highlightedEdgeIds: [...fullLifecycleEdges, "monitoring-risk"]
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Fraud loss rate", value: "0.08%", displayPercent: 8, type: "KPI" },
  { label: "Approval rate", value: "94.2%", displayPercent: 94, type: "KPI" },
  { label: "False positive rate", value: "1.7%", displayPercent: 17, type: "KPI" },
  { label: "Agentic transaction success", value: "91.4%", displayPercent: 91, type: "KPI" },
  { label: "Customer override rate", value: "3.1%", displayPercent: 31, type: "KPI" },
  { label: "Agent drift alerts", value: "12", displayPercent: 38, type: "KRI" },
  { label: "Velocity spike alerts", value: "7", displayPercent: 28, type: "KRI" },
  { label: "Token refresh anomalies", value: "5", displayPercent: 20, type: "KRI" },
  { label: "Permission escalation events", value: "4", displayPercent: 16, type: "KRI" },
  { label: "Intent mismatch rate", value: "2.4%", displayPercent: 24, type: "KRI" }
];

export const lifecycleSteps = [
  {
    title: "Trust starts before the transaction",
    body: "Registration and account enablement establish whether the agent is known, bound to the customer, and allowed to act."
  },
  {
    title: "Delegation narrows what the agent can do",
    body: "Permissions translate customer authority into practical controls such as spend limits, merchant scope, and approval requirements."
  },
  {
    title: "Intent validation connects why to what",
    body: "The system compares authenticated purchase intent with cart context, timing, merchant, credential, and behavior signals."
  },
  {
    title: "Decisioning balances fraud and friction",
    body: "Low risk can pass cleanly, medium risk gets selective step-up, and high risk is stopped with explainable reason codes."
  },
  {
    title: "Closed-loop visibility improves control health",
    body: "Monitoring tracks outcomes, overrides, drift, and KRIs so controls can adapt without turning every purchase into a hard stop."
  }
];

export const notes = [
  {
    title: "Why risk changes",
    body: "Agentic commerce inserts a delegated actor between customer intent and payment execution, so the risk question becomes whether the agent is acting within trusted authority."
  },
  {
    title: "Why intent matters",
    body: "A valid credential is not enough. The system needs confidence that the cart, merchant, timing, and amount still match authenticated customer intent."
  },
  {
    title: "Why visibility matters",
    body: "Closed-loop signals help distinguish normal automation from agent drift, token anomalies, permission misuse, or emerging abuse patterns."
  },
  {
    title: "Customer experience tradeoff",
    body: "The framework avoids blanket friction: approve trusted behavior, step up when uncertainty is manageable, and decline when delegated authority appears abused."
  }
];
