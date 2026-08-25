import type { ArchitectureIR } from "../architecture-ir";
import { toRenderModel, type RenderModel } from "../architecture-renderer";

export function buildArchitectureRender(ir: ArchitectureIR): RenderModel {
  return toRenderModel(ir);
}
