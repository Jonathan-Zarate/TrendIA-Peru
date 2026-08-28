import { handle } from 'hono/vercel'
import { createProductionApp } from '../backend/src/bootstrap.js'

export default handle(createProductionApp())
