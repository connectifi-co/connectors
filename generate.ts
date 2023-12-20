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

const createHookInput = (type: string, context: any) => {
  return createMockAPIGWProxyEvent({
    httpMethod: 'POST',
    body: JSON.stringify({
      context,
      destinations: ["destAppOne", "destAppTwo", "destAppThree"],
      source : "sourceApp"
    }),
  });
} 

if (process.argv[2] && process.argv[3]) {
  let json: any;
  switch(process.argv[2]) {
    case 'instrument' :
      const inst = {
        type: "fdc3.instrument",
        id: {
          ticker: process.argv[3],
        }
      };
      json = createHookInput('fdc3.instrument', inst);
    case 'contact' :
      const contact = {
        type: "fdc3.instrument",
        id: {
          ticker: process.argv[3],
        }
      };
      json = createHookInput('fdc3.contact', contact);
  }
  console.log(JSON.stringify(json, null, 2));
} else {
  console.log('Must provide a context type and key field');
}
