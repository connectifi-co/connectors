# Connectifi Hooks

Example hooks and serverless configuration to stand them up and get testing/implementing quickly ...

## what's inside

Connectifi Delivery Hook implementations, written in Typescript, along with Serverless configurations for common cloud providers.  Currently supported providers are:
 - AWS
 - Azure
 - Google

## getting started

The first step is to install the dependencies for this repo:

```bash
npm install
```

Once you have the dependencies installed, the next thing to do is select your cloud provider.  You'll need to have your credentials all setup in order to deploy the API functions.  There is more info in the README files in each provider directory.

### deployment

Deployment is standard serverless deployment.  There is more info in the README files in each provider directory.

## directories

NPM workspaces project.  There are workspaces for all the cloud providers which contain serverless configs as well as some common etc folders.

- `workspaces/aws` where all the AWS serverless configuration lives
- `workspaces/azure` where all the Azure serverless configuration lives
- `workspaces/google` where all the Google configuration lives
- `workspaces/common` common typescript functions, most of the code lives here

## hook input/test data

To make it easier to test hooks, there are some generic data utilities included in the project.  The can be used to generate input to hooks from an HTTP standpoint or generate specific provider events for executing functions directly.

Some examples of using the test utility are below.  The generator will simply output the JSON to standard out.  you can copy/paste from your terminal or pipe to files.

### aws lambda events

```bash
# generate AWS lambda event for a hook that processes fdc3.instrument context types
npm run data:aws fdc3.instrument AMZN

# generate AWS lambda event for a hook that processes fdc3.instrumentList context types
npm run data:aws fdc3.instrumentList AMZN,TSLA,BBG,MSFT

# generate AWS lambda event for a hook that processes fdc3.instrument context types
npm run data:aws fdc3.contact brian@connectifi.co

# generate AWS lambda event for a hook that processes fdc3.instrumentList context types
npm run data:aws fdc3.contactList brian@connectifi.co,nick@connectifi.co,kevin@connectifi.co
```

### http payloads

```bash
# generate an http post payload for a hook that processes fdc3.instrument context types
npm run data:aws fdc3.instrument AMZN

# generate an http post payload for a hook that processes fdc3.instrumentList context types
npm run data:http fdc3.instrumentList AMZN,TSLA,BBG

```

