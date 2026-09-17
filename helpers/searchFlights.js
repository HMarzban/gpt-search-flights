export const GPTFunctions = [
  {
    name: "get_flight_tickets",
    description:
      "Retrieves flight tickets for a given origin and destination airport on specified dates.",
    parameters: {
      type: "object",
      properties: {
        OriginAirport: {
          type: "string",
          description:
            'Origin airport code. This should be the short airport code of the city or state. Example: "THR"',
        },
        DestAirport: {
          type: "string",
          description:
            'Destination airport code. This should be the short airport code of the city or state. Example: "KIH"',
        },
        StrDepartDateTime: {
          type: "string",
          description:
            'Departure date for the flight. This should represent the date of flight ticket reservation or departure. The date format should be "dd-mm-yyyy", also convert data to en-US.',
        },
        StrArriveDateTime: {
          type: "string",
          description:
            'Return date for the flight. This should represent the return ticket reservation or return date. The date format should be "dd-mm-yyyy". If the flight is one-way, this should be set to "NaN-NaN-NaN".',
        },
        OneWay: {
          type: "boolean",
          description: 'Whether the flight is one-way or not. Example: "true"',
        },
      },
      required: ["OriginAirport", "DestAirport", "StrDepartDateTime", "OneWay"],
    },
  },
];


function parametersFrom(call) {
  if (call.name !== "get_flight_tickets") throw new Error("Unexpected function call");
  const parameters = JSON.parse(call.arguments);
  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters) ||
      !["OriginAirport", "DestAirport", "StrDepartDateTime"].every(key => typeof parameters[key] === "string" && parameters[key].trim()) ||
      typeof parameters.OneWay !== "boolean" ||
      (parameters.StrArriveDateTime !== undefined && typeof parameters.StrArriveDateTime !== "string")) {
    throw new Error("Invalid flight parameters");
  }
  return parameters;
}

function airport(value) {
  if (!value) return null;
  const { IATA, Name, PersianName, CityPersianName, CountryCode } = value;
  return { IATA, Name, PersianName, CityPersianName, CountryCode };
}
function flight(value) {
  if (!value) return null;
  const { JourneyDuration, FlightNumber, Aircraft, SeatsRemaining, DepartsAt, ArrivesAt } = value;
  return { DestinationAirport: airport(value.DestinationAirport), JourneyDuration, FlightNumber, Aircraft, SeatsRemaining, DepartsAt, ArrivesAt };
}

// Dependencies are injected so the historical function-calling flow can be tested offline.
export function createSearchFlights({ complete, getTickets, now = () => new Date() }) {
  return async c => {
    let content;
    try {
      ({ content } = await c.req.json());
      if (typeof content !== "string" || !content.trim()) throw new Error("Missing content");
    } catch {
      return c.json({ error: "Provide a JSON object with a nonempty content string." }, 400);
    }
    const messages = [
      { role: "system", content: `Search Iranian flights using the supplied tool. Today is ${now().toLocaleDateString("en-US", { dateStyle: "full" })}. Ask for missing dates or airports. This demo searches flights; it cannot book tickets.` },
      { role: "user", content },
    ];
    const request = () => complete({
      model: "gpt-3.5-turbo-0613", messages, functions: GPTFunctions,
      temperature: 0, frequency_penalty: 0, presence_penalty: 0,
    });
    try {
      const result = await request();
      const message = result?.data?.choices?.[0]?.message;
      if (!message) throw new Error("Missing model response");
      if (!message.function_call) return c.json(message);
      let parameters;
      try { parameters = parametersFrom(message.function_call); }
      catch { return c.json({ error: "The model returned invalid flight-search arguments." }, 502); }
      const initial = await getTickets(parameters);
      if (!initial?.SearchId) throw new Error("Missing search ID");
      const response = await getTickets(parameters, initial.SearchId);
      if (!Array.isArray(response?.Trips)) throw new Error("Invalid flight response");
      const tickets = response.Trips.map(ticket => ({
        OriginAirport: airport(ticket.OriginAirport),
        OutboundFlights: flight(ticket.OutboundFlights?.[0]),
        InboundFlights: flight(ticket.InboundFlights?.[0]),
        price: ticket.TotalPrice,
      }));
      messages.push(
        { role: "assistant", content: null, function_call: message.function_call },
        { role: "function", name: "get_flight_tickets", content: JSON.stringify(tickets) },
      );
      const followup = await request();
      const answer = followup?.data?.choices?.[0]?.message?.content;
      if (typeof answer !== "string") throw new Error("Missing final model response");
      return c.text(answer);
    } catch {
      return c.json({ error: "The model or flight provider could not complete this search." }, 502);
    }
  };
}
