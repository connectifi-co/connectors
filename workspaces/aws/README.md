# Connectifi Connectors for AWS

This configuration will create the connector lambdas and API gateway in AWS using the Serverless framework.

## Usage

### Credentials setup

Serverless uses the AWS sdk under the hood so if you're configured already, you may be all set.  In the event you have a custom aws auth setup, you may need to export some ENV vars.  The serverless auth config utils should also work for you.

### Deployment

Deploying the stack is as simple as running a single command.  you must however have your credentials setup properly for the provider.

```
$ npm run deploy <stagename>
```

After deploying, you should see output similar to:

```bash
Deploying connectifi-hooks to stage dev (us-east-1)

✔ Service deployed to stack connectifi-hooks-dev (41s)

endpoints:
  GET - https://q25wgl0gzg.execute-api.us-east-1.amazonaws.com/
  POST - https://q25wgl0gzg.execute-api.us-east-1.amazonaws.com/openfigi
  POST - https://q25wgl0gzg.execute-api.us-east-1.amazonaws.com/polygon
functions:
  index: connectifi-hooks-dev-index (41 kB)
  openfigi: connectifi-hooks-dev-openfigi (41 kB)
  polygon: connectifi-hooks-dev-polygon (41 kB)
```

_Note_: After deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

To undeploy the stack, run the undeploy command

```bash
npm run undeploy <stagename>
```

### Running the lambda locally

You can invoke the lambdas locally by calling each by name:

```bash
npx serverless invoke local --function polygonHook -p ../../data/aws/amzn-hook-event.json
```

### Running the lambda after deployment

After successful deployment, you can test the hook by calling the function by name:

```bash
npx serverless invoke --function polygonHook -p ../../data/aws/amzn-hook-event.json
```

### API Key management

If a hook implementation requires something like an api key or similar configuration, a .env file can be used.  For example, the polygon API requires an API KEY to make calls to it.  This is standard dotenv stuff.  *NOTE* the values will end in the lambda environment which isn't the best way to handle API keys in a production scenario.  Secrets manager or the parameter store are better choices but that is beyond the scope of this repo.

```bash
cp .env.sample .env

# edit the .env file to contain the real apy key value
```
