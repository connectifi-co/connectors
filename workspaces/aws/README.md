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
  GET - https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/
  POST - https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/deliveryhooks/{hook}
  POST - https://XXXXXXXX.execute-api.us-east-1.amazonaws.com/actions/{action}
functions:
  index: connectifi-hooks-dev-index (227 kB)
  deliveryhooks: connectifi-hooks-dev-deliveryhooks (227 kB)
  actions: connectifi-hooks-dev-actions (227 kB)
```

_Note_: After deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

To undeploy the stack, run the undeploy command

```bash
npm run undeploy <stagename>
```

### API Key management

If a hook implementation requires something like an api key or similar configuration, a .env file can be used.  For example, the polygon API requires an API KEY to make calls to it.  This is standard dotenv stuff.  *NOTE* the values will end in the lambda environment which isn't the best way to handle API keys in a production scenario.  Secrets manager or the parameter store are better choices but that is beyond the scope of this repo.

```bash
cp .env.sample .env

# edit the .env file to contain the real apy key value
```

_Note_: This puts the secret values in the function environment variables. For production deployments, you might want to use a secure parameter store such as AWS SSM or equivalent.
