# Flight-GPT: A Puppet Project Experimenting with OpenAI's Function Feature

## Overview

Flight-GPT is an experimental Deno-based project that explores OpenAI's new function feature. It simulates a flight ticket booking system, serving as a platform for understanding the capabilities of OpenAI API. The API is built on the Hono framework.

## Getting Started

### Prerequisites

To run this project, you need to have [Deno](https://deno.land/) installed on your system.

### Installation

1. Clone the repo
```bash
git clone https://github.com/<username>/flight-gpt.git
cd flight-gpt
```
2.Install the required dependencies
```bash
# This project uses Deno, no separate installation command is required
```
## Usage
To start the server, run:
```bash
deno run --allow-net --allow-env --allow-read index.ts
```
Or you can use the provided npm script:
```bash
npm run dev
```

# Features
- Fetch flight ticket details based on parameters like origin airport, destination airport, and dates.
- Integration with OpenAI API to generate human-like text.
- Provides an experimental platform to explore OpenAI's new function feature.

# License
This project is MIT licensed. See the LICENSE file for details.

