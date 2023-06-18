# 🛫 Flight-GPT: A Fun Puppet Project Playing with OpenAI's Cool Function Feature 🤖

Flight-GPT is a fun, experimental project built on Deno 🦕 that dives into the
exciting world of OpenAI's new function feature,
[Read More](https://openai.com/blog/function-calling-and-other-api-updates).
Think of it as your very own flight ticket booking simulator, perfect for
getting to grips with what the OpenAI API can do. It's all neatly packaged into
the Hono framework. 🎁

In order to have flight API I used [trip.ir](https://www.trip.ir/), I hope they
are not get mad at me 😅.

## 🚀 Getting Started

### 🔧 Prerequisites

Before we take off, make sure you have [Deno](https://deno.land/) installed on
your system. This is your passport to our project! 🛂

### 📦 Installation

1. First, let's get our hands on the project. Use your favorite terminal and
   clone the repo:

```bash
git clone https://github.com/HMarzban/gpt-search-flights.git
cd gpt-search-flights
```

2. Next, let's make sure we have all the stuff we need. In this case, we're
   traveling light thanks to Deno:

```bash
# This project uses Deno, so no need for extra baggage 🧳!
```

## 🎮 Usage

Before we're ready for takeoff, there's a tiny bit of prep work to do. 🛫

Firstly, you'll need to make a copy of the `.example.env` file and rename it to
`.env`. This is where you'll store your `OPENAI_API_KEY`.

```bash
cp .example.env .env
```

Then, open the .env file and replace YOUR_OPENAI_API_KEY with your actual OpenAI
API key.

Once you've done that, you're ready to start the server! You can do this by
running:

```bash
deno run --allow-net --allow-env --allow-read index.ts
```

Or if you prefer, you can use the friendly npm script we've provided:

```bash
npm run dev
```

## 🎯 Testing the API

Ready to see Flight-GPT in action? You can use tools like Postman or `curl` to
interact with our API. If you're using **Postman**, start a new request, select
the POST method, and enter your local server's URL followed by the
`/gpt/search-flights` endpoint. In the 'Body' tab, select 'raw' and 'JSON', then
enter a JSON object like the one below:

```json
{
  "content": "بلیط هواپیما از تهران به کیش برای روز ۲۳ و برگشت برای روز ۲۶"
}
```

If you're a curl fan, you can run a command similar to the following in your
terminal:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"content": "flight ticket from tehran to mashhad airport for 23 and return 26 of this month"}' http://localhost:<your_port>/gpt/search-flights
```

Remember, content can be in any language, but dates and day numbers should be
based on the Gregorian calendar. Happy testing! 🚀

## 🎁 Example Response

Once you've made a POST request to `/gpt/search-flights`, you'll get a response
that provides detailed information about the available flight options. Here's an
example of how the response might look:

```
Here are the available flight options for your trip from Tehran to Kish Island:

1. Flight ZV4051:
- Departure: Tehran Mehr Abad Airport (THR) at 06:50 AM on 23-06-2023
- Arrival: Kish Island Airport (KIH) at 08:45 AM on 23-06-2023
- Duration: 1 hour and 55 minutes
- Seats Remaining: 9
- Price: 3,740,500 Iranian Rials

Return Flight QB1225:
- Departure: Kish Island Airport (KIH) at 11:05 AM on 26-06-2023
- Arrival: Tehran Mehr Abad Airport (THR) at 12:50 PM on 26-06-2023
- Duration: 1 hour and 45 minutes
- Seats Remaining: 9

2. Flight ZV4051:
- Departure: Tehran Mehr Abad Airport (THR) at 06:50 AM on 23-06-2023
- Arrival: Kish Island Airport (KIH) at 08:45 AM on 23-06-2023
- Duration: 1 hour and 55 minutes
- Seats Remaining: 9
- Price: 3,740,500 Iranian Rials

Return Flight Y97014:
- Departure: Kish Island Airport (KIH) at 12:15 PM on 26-06-2023
- Arrival: Tehran Mehr Abad Airport (THR) at 02:00 PM on 26-06-2023
- Duration: 1 hour and 45 minutes
- Seats Remaining: 9

3. Flight ZV4051:
- Departure: Tehran Mehr Abad Airport (THR) at 06:50 AM on 23-06-2023
- Arrival: Kish Island Airport (KIH) at 08:45 AM on 23-06-2023
- Duration: 1 hour and 55 minutes
- Seats Remaining: 9
- Price: 3,740,500 Iranian Rials

Return Flight Y97080:
- Departure: Kish Island Airport (KIH) at 11:45 PM on 26-06-2023
- Arrival: Tehran Mehr Abad Airport (THR) at 01:30 AM on 27-06-2023
- Duration: 1 hour and 45 minutes
- Seats Remaining: 1

4. Flight ZV4051:
- Departure: Tehran Mehr Abad Airport (THR) at 06:50 AM on 23-06-2023
- Arrival: Kish Island Airport (KIH) at 08:45 AM on 23-06-2023
- Duration: 1 hour and 55 minutes
- Seats Remaining: 9
- Price: 3,973,800 Iranian Rials

Return Flight ZV4050:
- Departure: Kish Island Airport (KIH) at 02:05 PM on 26-06-2023
- Arrival: Tehran Mehr Abad Airport (THR) at 04:05 PM on 26-06-2023
- Duration: 2 hours
- Seats Remaining: 9

Please let me know if you would like to book any of these flights.
```

The response provides you with multiple flight options, each containing details
for both the outbound and return flights. This includes the flight number,
departure and arrival information, duration of the flight, number of remaining
seats, and the price (for outbound flights).

So go ahead and start exploring the world of flight options with Flight-GPT!
🌍🛫

## ✨ Features

- Discover flight ticket details based on things like your starting airport,
  where you're heading, and when you're planning to travel. 🌍
- Experience the magic of integration with the OpenAI API to generate text
  that's just like chatting with a human. 🗣
- Provides a fun, experimental sandbox to play around with OpenAI's new function
  feature. 🏖

## 📜 License

This project is under the MIT license. For the full legal stuff, check out the
LICENSE file. 🕵️‍♂️
