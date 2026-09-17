import { Configuration, OpenAIApi } from "npm:openai@3.2.1";
import getTickets from "../helpers/getTickets.js";
import { createSearchFlights } from "../helpers/searchFlights.js";

const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
}));

export default createSearchFlights({
  complete: options => openai.createChatCompletion(options),
  getTickets,
});
