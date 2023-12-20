# Connectifi Hooks for AWS

This configuration will create the hook lambdas and API gateway in AWS using the Serverless framework.

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

### Invocation

After successful deployment, you can test the hook by calling the function by name:

```bash
npx serverless invoke --function polygon -p ../../data/aws/amzn-hook-event.json
```

### Local development

You can invoke the lambdas locally by calling each by name:

```bash
npx serverless invoke local --function polygon -p ../../data/aws/amzn-hook-event.json
```

#### DISCLAIMER

It *should* also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, someone would need to do a touch more research but here's what should be possible:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
