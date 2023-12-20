interface awsEvent {
  httpMethod: string;
  body: string;
  headers: any;
  pathParameters: any;
  queryStringParameters: any;
  path: string;
}

const createMockAPIGWProxyEvent = ({
  httpMethod = '',
  body = '',
  path = '',
  headers = {},
  pathParameters = {},
  queryStringParameters = {},
}):awsEvent => {
  return {
    httpMethod,
    body,
    headers,
    queryStringParameters,
    pathParameters,
    path,
  };
};

const createHookInput = (provider: string, context: any) => {
  switch(provider) {
    case 'aws' :
      return createMockAPIGWProxyEvent({
        httpMethod: 'POST',
        body: JSON.stringify({
          context,
          destinations: ["destAppOne", "destAppTwo", "destAppThree"],
          source : "sourceApp"
        }),
      });
    case 'azure' :
      return '';
    case 'http' :
      return {
        context,
        destinations: ["destAppOne", "destAppTwo", "destAppThree"],
        source : "sourceApp"
      };
  }
} 

const provider = process.argv[2];
const contextType = process.argv[3];
const contextKeys = process.argv[4];

if (provider && contextType && contextKeys) {
  let payload: any;
  switch(contextType) {
    case 'fdc3.instrument' :
      payload = {
        type: contextType,
        id: {
          ticker: contextKeys,
        }
      };
      break;
    case 'fdc3.instrumentList' :
      const tickers = contextKeys.split(',');
      payload = {
        type: contextType,
        instruments: tickers.map(ticker => ({
          type: 'fdc3.instrument',
          id: {
            ticker,
          }
        })),
      };
      break;
    case 'fdc3.contact' :
      payload = {
        type: contextType,
        id: {
          email: contextKeys,
        }
      };
      break;
    case 'fdc3.contactList' :
      const contacts = contextKeys.split(',');
      payload = {
        type: contextType,
        contacts: contacts.map(email => ({
          type: 'fdc3.contact',
          id: {
            email,
          }
        })),
      };
      break;
  }
  const json = createHookInput(provider, payload);
  console.log(JSON.stringify(json, null, 2));
} else {
  console.log('usage: ts-node generate.ts <provider> <context type> <context id keys>');
}
