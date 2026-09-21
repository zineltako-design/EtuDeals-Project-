export type Bindings = {
  DB: D1Database
  R2: R2Bucket
  JWT_SECRET: string
  ASSETS: Fetcher
}

export type AppContext = {
  Bindings: Bindings
  Variables: {
    user?: {
      id: number
      email: string
      role: string
    }
  }
}
