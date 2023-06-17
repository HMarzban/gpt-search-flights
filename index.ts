import { serve } from 'https://deno.land/std@0.191.0/http/server.ts'
import { Hono } from 'npm:hono@3.2.5'
import 'https://deno.land/std@0.191.0/dotenv/load.ts'

import getTickets from './routers/getTickets.ts'
import gptSearchFlights from './routers/gptSearchFlights.ts'

const app = new Hono()

// Routes
app.get('/', (c) => c.text('Hello Hono!'))
app.get('/tickets', getTickets)
app.post('/gpt/search-flights', gptSearchFlights)

// Serve App
serve(app.fetch)
