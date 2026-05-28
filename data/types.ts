import type { Edge, Node } from "@xyflow/react";

export type Decision = "Approve" | "Step-Up Auth" | "Decline";

export type Scenario = {
  id: string;
  name: string;
  shortDescription: string;
  decision: Decision;
  riskScore: number;
  customerFriction: "Low" | "Moderate" | "High";
  authenticationOutcome: string;
  controlPosture: string;
  reasonCodes: string[];
  triggeredKris: string[];
  highlightedNodeIds: string[];
  highlightedEdgeIds: string[];
};

export type FlowNode = Node<{
  title: string;
  subtitle: string;
}>;

export type FlowEdge = Edge;

export type DashboardMetric = {
  label: string;
  value: string;
  displayPercent: number;
  type: "KPI" | "KRI";
};
