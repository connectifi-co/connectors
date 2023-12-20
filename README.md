# Connectifi Hooks

Example hooks and serverless configuration to stand them up and get testing/implementing quickly ...

## what's inside

Connectifi Delivery Hook implementations, written in Typescript, along with Serverless configurations for common cloud providers.  Currently supported providers are:
 - AWS
 - Azure
 - Google

## getting started

You'll need to choose your cloud provider and have your credentials all setup in order to deploy the API functions.  This repo uses the serverless framework so running `npx serverless config:auth` will work (keep in mind that this would write a ~/.aws/credentials file if using aws)

### deployment

Deployment is standard serverless deployment.  There is more info in the README files in each provider directory.

## directories

NPM workspaces project.  There are workspaces for all the cloud providers which contain serverless configs as well as some common etc folders.

- `workspaces/aws` where all the AWS serverless configuration lives
- `workspaces/azure` where all the Azure serverless configuration lives
- `workspaces/google` where all the Google configuration lives
- `workspaces/common` common typescript functions, most of the code lives here
