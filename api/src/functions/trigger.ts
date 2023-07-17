import type { APIGatewayEvent } from 'aws-lambda'
import { TriggerClient, Job, eventTrigger } from "@trigger.dev/sdk";

const client = new TriggerClient({
  id: "redwood-blog",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});

new Job(client, {
  id: "example-job",
  name: "Example Job",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "example-event",
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("This is happening inside RedwoodJS!", { payload, ctx })
  }
})

export async function handler(event: APIGatewayEvent) {
  const request = convertToStandardRequest(event);

  const response = await client.handleRequest(request);

  return {
    statusCode: response.status,
    headers: {
      ...(response.headers ?? {}),
      "content-type": "application/json"
    },
    body: JSON.stringify(response.body)
  }
}

function convertToStandardRequest(event: APIGatewayEvent): Request {
  const headers = new Headers();

  for (const [key, value] of Object.entries(event.headers)) {
    headers.set(key, value);
  }

  const request = new Request(`https://${event.headers.Host ?? "redwoodjs.dev"}${event.path}`, {
    method: event.httpMethod,
    headers,
    body: event.body,
    // @ts-ignore
    duplex: "half"
  })

  return request;
}