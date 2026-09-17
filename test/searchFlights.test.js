import { test } from "node:test";
import assert from "node:assert/strict";
import { createSearchFlights } from "../helpers/searchFlights.js";
const result = message => ({ data: { choices: [{ message }] } });
const call = argumentsText => result({ function_call: { name: "get_flight_tickets", arguments: argumentsText } });
const parameters = { OriginAirport: "THR", DestAirport: "KIH", StrDepartDateTime: "23-06-2023", OneWay: true };
const context = (body = { content: "Find a flight" }) => ({
  req: { json: async () => body },
  json: (body, status = 200) => ({ body, status, type: "json" }),
  text: (body, status = 200) => ({ body, status, type: "text" }),
});

test("a normal model response does not call the flight provider", async () => {
  const handler = createSearchFlights({ complete: async () => result({ content: "Which date?" }), getTickets: () => assert.fail("unexpected tool call") });
  assert.deepEqual(await handler(context()), { body: { content: "Which date?" }, status: 200, type: "json" });
});

test("invalid JSON arguments, missing fields and unknown tools return controlled errors", async () => {
  for (const output of [call("{"), call("{}"), result({ function_call: { name: "other", arguments: "{}" } })]) {
    const handler = createSearchFlights({ complete: async () => output, getTickets: () => assert.fail("unexpected provider call") });
    assert.equal((await handler(context())).status, 502);
  }
});

test("empty ticket results are sent to the model as an empty list", async () => {
  let requests = 0;
  let lookups = 0;
  const handler = createSearchFlights({
    complete: async options => {
      if (++requests === 1) return call(JSON.stringify(parameters));
      assert.equal(options.messages.at(-1).content, "[]");
      return result({ content: "No flights found." });
    },
    getTickets: async (args, searchId) => {
      assert.deepEqual(args, parameters);
      if (++lookups === 1) return { SearchId: "fixture" };
      assert.equal(searchId, "fixture");
      return { Trips: [] };
    },
  });
  assert.deepEqual(await handler(context()), { body: "No flights found.", status: 200, type: "text" });
});

test("one-way results allow a missing inbound segment", async () => {
  let calls = 0;
  const handler = createSearchFlights({
    complete: async options => {
      if (++calls === 1) return call(JSON.stringify(parameters));
      assert.equal(JSON.parse(options.messages.at(-1).content)[0].InboundFlights, null);
      return result({ content: "One-way flight" });
    },
    getTickets: async (_, id) => id ? { Trips: [{ OutboundFlights: [{}], TotalPrice: 100 }] } : { SearchId: "id" },
  });
  assert.equal((await handler(context())).status, 200);
});

test("provider errors and followup failures are returned without leaking details", async () => {
  for (const failAt of ["model", "provider", "followup"]) {
    let calls = 0;
    const handler = createSearchFlights({
      complete: async () => {
        if (failAt === "model" || ++calls === 2) throw new Error("private provider detail");
        return call(JSON.stringify(parameters));
      },
      getTickets: async (_, id) => {
        if (failAt === "provider") throw new Error("private provider detail");
        return id ? { Trips: [] } : { SearchId: "id" };
      },
    });
    const response = await handler(context());
    assert.equal(response.status, 502);
    assert.doesNotMatch(JSON.stringify(response), /private provider detail/);
  }
});

test("missing content and malformed request JSON return 400", async () => {
  const handler = createSearchFlights({ complete: () => assert.fail("unexpected API call") });
  for (const body of [{}, { content: "" }, null]) assert.equal((await handler(context(body))).status, 400);
  const c = context(); c.req.json = async () => { throw new Error("bad JSON"); };
  assert.equal((await handler(c)).status, 400);
});
