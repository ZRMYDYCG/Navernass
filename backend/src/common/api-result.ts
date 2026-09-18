export interface PageMeta {
  page: number
  pageSize: number
  total: number
}

export class ApiResult<T> {
  constructor(
    public readonly data: T,
    public readonly meta?: PageMeta,
  ) {}

  static page<T>(data: T[], meta: PageMeta) {
    return new ApiResult(data, meta)
  }
}
