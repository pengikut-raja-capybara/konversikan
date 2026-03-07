export type FeatureExtractor = (
  inputs: string[] | string,
  options?: Record<string, unknown>
) => Promise<unknown>

export type ProgressStage =
  | 'loading_model'
  | 'encoding_source'
  | 'encoding_target'
  | 'scoring'
  | 'done'

export interface SemanticProgress {
  stage: ProgressStage
  processed: number
  total: number
  percent: number
  message: string
  cacheHits?: number
  cacheMisses?: number
}

export interface SemanticMatchOptions {
  onProgress?: (progress: SemanticProgress) => void
}
