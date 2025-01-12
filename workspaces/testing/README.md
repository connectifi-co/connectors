# Testing
Integration testing utilities

## Running the tests
These integation tests are intended to be run after deployment.  The test harness is a very simple fetch mechanism which
uses files in the data directory.  New data files can be added as needed.  For convenience, it's recommended to add 
your API host to the environment:

```
export INTEROP_HOST=https://XXXXXXXXXX.YYYYYYYY.ZZZZZ.com
```

### delivery hooks
Some examples of testing delivery hooks

```
npm run test:post $INTEROP_HOST/deliveryhooks/polygonIO ./data/deliveryhooks/instrument.json
npm run test:post $INTEROP_HOST/deliveryhooks/openfigi ./data/deliveryhooks/instrument.json
npm run test:post $INTEROP_HOST/deliveryhooks/slack ./data/deliveryhooks/contact.json
```

### link actions
Some examples of testing link actions 

```
npm run test:post $INTEROP_HOST/actions/emailLink ./data/links/contactList.json
npm run test:post $INTEROP_HOST/actions/teamsLink ./data/links/contactList.json
npm run test:post $INTEROP_HOST/actions/slackLink ./data/links/contact.json
npm run test:post $INTEROP_HOST/actions/companyHQLink ./data/links/instrument.json
npm run test:post $INTEROP_HOST/actions/locationLink ./data/links/location.json
```

### data api actions
Some examples of testing data api actions 

```
npm run test:post $INTEROP_HOST/actions/polygonIO ./data/api/getPrice.json
npm run test:post $INTEROP_HOST/actions/polygonIO ./data/api/getDetails.json
npm run test:post $INTEROP_HOST/actions/openAI ./data/api/contactList.json
```