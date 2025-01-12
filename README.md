# Connectifi Connectors
Example Actions Connectors and Delivery Hooks for the Connectifi Integration Platform. Use this repo as a starting point and building blocks for implementing your own integrations with Connectifi.

## About Connectifi
Connectifi is a next generation integration platform that connects applications, services, and agents with deep user experience integration that works across any device and client technology.  Connectifi integrates full stack, with support for the FDC3 protocol for UI integration and REST integration with services and SaaS applications.

## Working with Context Data and Intents

Inspired by the Android and Apple intents systems, Connectifi uses Intents and Context metadata to describe functions and data interfaces and support reusable, plug and play integrations across APIs and apps.  Use the provided FDC3 and Connect name spaces and/or define your own.  

## Connector Types

There are two main types of connectors in this project:

- Delivery Hooks - which transform context data just before it is delivered to one or more destinations.
- Actions - which respond to an *intent* to return either a URL to launch or a data response.

### Delivery Hooks
Delivery Hooks act as transformers on the Connectifi message bus, acting whenever context data messages are delivered whether from a broadcast or an intent.  Delivery Hooks are assigned to act on specific context data types on a per/directory basis and they can modify context data selectively based on the recipient, this is extremely helpful for use cases such as mapping identifiers across multiple destinations and selectively redacting sensitive data.

<img src="./images/deliveryHooks-diagram.jpeg" alt="Delivery Hooks Diagram" width="80%">

### Launch Actions
Launch Actions allow an application to perform data transformations ahead of launching a specific destination or to define services that perform actions which result in the launch of a particular destination.  For example, launch actions can be used to lookup a SlackId from an email in order to generate the deep link to start a chat with the user.  Or, a launch action could be used to post a new contact into Hubspot and then launch the contact's Hubspot page directly.

<img src="./images/launchAction-diagram.jpeg" alt="Launch Action Diagram" width="80%">

### API Actions
API Actions allow an application to leverage REST services to return data for an intent.  The response data can then be used by the calling application without the need to launch another instance.  For example, from a it's UI, an application can raise the *GetPrice* intent and the end user can choose the source they want to get pricing data from.  On response, the application UI can be updated based on a standard context data format.  The raising application didn't have to build bespoke integrations into each data source and it can let the end user choose their source based on their own preference.

<img src="./images/apiAction-diagram.jpeg" alt="API Action Diagram" width="80%">

# Using this Project 

## What's inside

Connector implementations, written in Typescript, along with Serverless configurations for common cloud providers.  Currently supported providers are:
 - AWS
 - Azure (TBD)

## Getting Started

The first step is to install the dependencies for this repo:

```bash
npm install
```

Once you have the dependencies installed, the next thing to do is select your cloud provider.  You'll need to have your credentials all setup in order to deploy the API functions.  There is more info in the README files in each provider directory.

### Deployment

Deployment is standard serverless deployment.  There is more info in the README files in each provider directory.

## Directories

NPM workspaces project.  There are workspaces for all the cloud providers which contain serverless configs as well as some common etc folders.

- `workspaces/aws` AWS IAC and provider specific code
- `workspaces/common` common typescript functions, most of the code lives here

## Adding a Connector
Adding a new connector is easy.  Follow the steps outlined in the [common readme](workspaces/common/README.md)

## Unit and Integration tests

```bash
npm run test
```

If you want to enable integration testing of OpenAI connectors in your local environment set the following env variables:

```bash
export CFI_OPENAI_API_KEY=<your api key>
export CFI_OPENAI_INTEGRATION_TESTS=true # any value will work
```

This will enable the tests in `workspaces/common/actions/api/openAI/tests/openai-integration-tests.spec.ts`. You can extend or use these tests as a template for your openAI actions
