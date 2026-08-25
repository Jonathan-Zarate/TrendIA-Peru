import { handle } from 'hono/vercel'
import { createProductionApp } from '../src/bootstrap.js'

export default handle(createProductionApp())
