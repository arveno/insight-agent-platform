import type { RelationshipGraphNodeKind } from "./models";

type RelationshipGraphColorSet = {
  fill: string;
  selectedStroke: string;
  stroke: string;
};

type RelationshipGraphPalette = {
  asset: RelationshipGraphColorSet;
  edge: {
    selectedStroke: string;
    stroke: string;
  };
  empty: RelationshipGraphColorSet;
  evidence: RelationshipGraphColorSet;
  field: RelationshipGraphColorSet;
  structure: RelationshipGraphColorSet;
  usage: RelationshipGraphColorSet;
};

const lightSelectedStroke = "#2563EB";
const darkSelectedStroke = "#60A5FA";

const lightRelationshipGraphPalette = {
  asset: {
    fill: "#EFF6FF",
    selectedStroke: lightSelectedStroke,
    stroke: "#93C5FD"
  },
  edge: {
    selectedStroke: lightSelectedStroke,
    stroke: "#CBD5E1"
  },
  empty: {
    fill: "#F8FAFC",
    selectedStroke: lightSelectedStroke,
    stroke: "#CBD5E1"
  },
  evidence: {
    fill: "#FFF7ED",
    selectedStroke: lightSelectedStroke,
    stroke: "#FDBA74"
  },
  field: {
    fill: "#FFFBEB",
    selectedStroke: lightSelectedStroke,
    stroke: "#FCD34D"
  },
  structure: {
    fill: "#F0FDF4",
    selectedStroke: lightSelectedStroke,
    stroke: "#86EFAC"
  },
  usage: {
    fill: "#F5F3FF",
    selectedStroke: lightSelectedStroke,
    stroke: "#C4B5FD"
  }
} as const satisfies RelationshipGraphPalette;

const darkRelationshipGraphPalette = {
  asset: {
    fill: "#102A43",
    selectedStroke: darkSelectedStroke,
    stroke: "#3B82F6"
  },
  edge: {
    selectedStroke: darkSelectedStroke,
    stroke: "#475569"
  },
  empty: {
    fill: "#1F2937",
    selectedStroke: darkSelectedStroke,
    stroke: "#475569"
  },
  evidence: {
    fill: "#3B1D0A",
    selectedStroke: darkSelectedStroke,
    stroke: "#F97316"
  },
  field: {
    fill: "#3A2A0A",
    selectedStroke: darkSelectedStroke,
    stroke: "#EAB308"
  },
  structure: {
    fill: "#123524",
    selectedStroke: darkSelectedStroke,
    stroke: "#22C55E"
  },
  usage: {
    fill: "#241B4B",
    selectedStroke: darkSelectedStroke,
    stroke: "#8B5CF6"
  }
} as const satisfies RelationshipGraphPalette;

function getRelationshipGraphPalette(isDarkMode: boolean) {
  return isDarkMode ? darkRelationshipGraphPalette : lightRelationshipGraphPalette;
}

function getNodeColorKey(kind: RelationshipGraphNodeKind) {
  if (kind === "asset" || kind === "document") {
    return "asset";
  }

  if (kind === "table" || kind === "chunk_group") {
    return "structure";
  }

  if (kind === "field" || kind === "chunk") {
    return "field";
  }

  if (kind === "evidence") {
    return "evidence";
  }

  if (kind === "usage") {
    return "usage";
  }

  return "empty";
}

export function getRelationshipGraphEdgeColors(isDarkMode: boolean) {
  return getRelationshipGraphPalette(isDarkMode).edge;
}

export function getRelationshipGraphNodeColors(
  kind: RelationshipGraphNodeKind,
  isDarkMode: boolean
) {
  const palette = getRelationshipGraphPalette(isDarkMode);

  return palette[getNodeColorKey(kind)];
}
