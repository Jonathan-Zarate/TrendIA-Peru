export type TrendErrorCode = 'TREND_NOT_FOUND' | 'CATEGORY_NOT_FOUND' | 'TREND_SLUG_CONFLICT' | 'SOURCE_CONFLICT' | 'SOURCE_REQUIRED' | 'TREND_NOT_EDITABLE' | 'INVALID_STATUS_TRANSITION'

export class TrendError extends Error {
  constructor(
    public readonly code: TrendErrorCode,
    message: string,
    public readonly status: 404 | 409,
  ) {
    super(message)
    this.name = 'TrendError'
  }
}
