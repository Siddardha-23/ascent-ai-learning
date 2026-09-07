"use client";

import type { ComponentType } from "react";
import { RequestFlow } from "./RequestFlow";
import {
  WeightedSumViz,
  ForwardBackpropViz,
  TokenizationViz,
  AttentionViz,
  EmbeddingsViz,
} from "./Computations";
import {
  RagPipelineViz,
  ToolLoopViz,
  LangGraphViz,
  GraphTypesViz,
  InjectionBoundaryViz,
  CacheTaxonomyViz,
} from "./Diagrams";

/** Maps a content visualId to its interactive component. */
export const VISUALS: Record<string, ComponentType> = {
  "request-flow": RequestFlow,
  "weighted-sum": WeightedSumViz,
  "forward-backprop": ForwardBackpropViz,
  tokenization: TokenizationViz,
  attention: AttentionViz,
  embeddings: EmbeddingsViz,
  "rag-pipeline": RagPipelineViz,
  "tool-loop": ToolLoopViz,
  langgraph: LangGraphViz,
  "graph-types": GraphTypesViz,
  "injection-boundary": InjectionBoundaryViz,
  "cache-taxonomy": CacheTaxonomyViz,
};

export function Visual({ id }: { id: string }) {
  const Cmp = VISUALS[id];
  if (!Cmp) return null;
  return <Cmp />;
}
