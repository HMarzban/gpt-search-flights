import { Configuration, OpenAIApi } from 'npm:openai@3.2.1'
import getTickets from '../helpers/getTickets.ts'

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY') || ''
})

const openai = new OpenAIApi(configuration)

// helpers
const GPT_MODEL = 'gpt-3.5-turbo-0613'
const GPTFunctions = [
  {
    name: 'get_flight_tickets',
    description:
      'Retrieves flight tickets for a given origin and destination airport on specified dates.',
    parameters: {
      type: 'object',
      properties: {
        OriginAirport: {
          type: 'string',
          description:
            'Origin airport code. This should be the short airport code of the city or state. Example: "THR"'
        },
        DestAirport: {
          type: 'string',
          description:
            'Destination airport code. This should be the short airport code of the city or state. Example: "KIH"'
        },
        StrDepartDateTime: {
          type: 'string',
          description:
            'Departure date for the flight. This should represent the date of flight ticket reservation or departure. The date format should be "dd-mm-yyyy", also convert data to en-US.'
        },
        StrArriveDateTime: {
          type: 'string',
          description:
            'Return date for the flight. This should represent the return ticket reservation or return date. The date format should be "dd-mm-yyyy". If the flight is one-way, this should be set to "NaN-NaN-NaN".'
        },
        OneWay: {
          type: 'boolean',
          description: 'Whether the flight is one-way or not. Example: "true"'
        }
      },
      required: ['OriginAirport', 'DestAirport', 'StrDepartDateTime', 'OneWay']
    }
  }
]

export default async (c) => {
  const { content } = await c.req.json()

  console.info('Input message: ', content)
  const options: any = {
    dateStyle: 'full'
  }

  const CompletionMessages: any = [
    {
      role: 'assistant',
      content: `Welcome to our Iranian plane ticket booking system!
      As of today, ${new Date().toLocaleDateString(
        options
      )}, all date calculations will be based on this date and will not consider prior dates.
      It's crucial to remember that weekends are on Thursday and Friday.
      For the purpose of this system, any airports mentioned by the user will be assumed to be situated in Iran.
      Finally, when the data is ready, show the answer to the user in a relevant, organized and discrete manner.`
    },
    {
      role: 'user',
      content: content
    }
  ]

  const result = await openai.createChatCompletion({
    model: GPT_MODEL,
    messages: CompletionMessages,
    functions: GPTFunctions,
    temperature: 0,
    frequency_penalty: 0,
    presence_penalty: 0
  })

  console.info('Output message: ', result.data.choices[0].message.function_call.name)

  if (result.data.choices[0].message.function_call) {
    const inputFunctionParameters = JSON.parse(
      result.data.choices[0].message.function_call.arguments
    )

    console.info('Need to Fire Function with this parameters: ', inputFunctionParameters)

    const responseTickets0 = await getTickets(inputFunctionParameters)
    const responseTickets = await getTickets(inputFunctionParameters, responseTickets0.SearchId)

    const tickets = responseTickets.Trips.map((ticket) => {
      const result = {
        OriginAirport: {
          IATA: ticket.OriginAirport.IATA,
          Name: ticket.OriginAirport.Name,
          PersianName: ticket.OriginAirport.PersianName,
          CityPersianName: ticket.OriginAirport.CityPersianName
        },
        OutboundFlights: {
          DestinationAirport: {
            IATA: ticket.OutboundFlights[0].DestinationAirport.IATA,
            Name: ticket.OutboundFlights[0].DestinationAirport.Name,
            PersianName: ticket.OutboundFlights[0].DestinationAirport.PersianName,
            CityPersianName: ticket.OutboundFlights[0].DestinationAirport.CityPersianName
          },
          JourneyDuration: ticket.OutboundFlights[0].JourneyDuration,
          FlightNumber: ticket.OutboundFlights[0].FlightNumber,
          Aircraft: ticket.OutboundFlights[0].Aircraft,
          SeatsRemaining: ticket.OutboundFlights[0].SeatsRemaining,
          DepartsAt: ticket.OutboundFlights[0].DepartsAt,
          ArrivesAt: ticket.OutboundFlights[0].ArrivesAt
        },
        InboundFlights: {
          DestinationAirport: {
            IATA: ticket.InboundFlights[0]?.DestinationAirport.IATA,
            Name: ticket.InboundFlights[0]?.DestinationAirport.Name,
            PersianName: ticket.InboundFlights[0]?.DestinationAirport.PersianName,
            CityPersianName: ticket.InboundFlights[0]?.DestinationAirport.CityPersianName,
            CountryCode: ticket.InboundFlights[0]?.DestinationAirport.CountryCode
          },
          JourneyDuration: ticket.InboundFlights[0]?.JourneyDuration,
          FlightNumber: ticket.InboundFlights[0]?.FlightNumber,
          Aircraft: ticket.InboundFlights[0]?.Aircraft,
          SeatsRemaining: ticket.InboundFlights[0]?.SeatsRemaining,
          DepartsAt: ticket.InboundFlights[0]?.DepartsAt,
          ArrivesAt: ticket.InboundFlights[0]?.ArrivesAt
        },
        price: ticket.TotalPrice
      }
      return result
    })

    console.info('Total Founded Tickets: ', tickets.length)

    CompletionMessages.push({
      role: 'assistant',
      content: null,
      function_call: {
        name: 'get_flight_tickets',
        arguments: result.data.choices[0].message.function_call.arguments
      }
    })

    CompletionMessages.push({
      role: 'function',
      name: 'get_flight_tickets',
      content: JSON.stringify(tickets)
    })

    const newResult = await openai
      .createChatCompletion({
        model: GPT_MODEL,
        messages: CompletionMessages,
        functions: GPTFunctions,
        temperature: 0,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      .catch((error) => {
        console.log(error.message)
        return c.html(error.message)
      })

    return c.html(newResult.data.choices[0].message.content)
  }

  return c.json(result.data.choices[0].message)
}
