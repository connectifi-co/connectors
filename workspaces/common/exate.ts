import type { Context } from '@finos/fdc3';
import { ContextTypes } from '@finos/fdc3';
import { EXATE_ID_URL, EXATE_DATA_URL } from './constants';
import { awsResponse } from './utils';


const filterContext = async (apiKey: string, clientId: string, clientSecret: string, context : Context) : Promise<Context> => {

    //get the bearer token
    const idUrl = EXATE_ID_URL;
    const idHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Api-Key': apiKey,
      };
    
    const form  = [
        ['client_id',clientId],
        ['client_secret', clientSecret],
        ['grant_type', 'client_credentials']
        ];
    
    const formBody : Array<string> = [];
    form.forEach((pair) => {
      formBody.push(`${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`);
    });
    
    console.log('exate token request', formBody.join('&'));
    
    const idRes = await fetch(idUrl, { method: 'POST', headers: idHeaders, body: formBody.join('&') });
    if (!idRes.ok) {
      const errText = await idRes.text();
      console.error(errText);
      throw new Error(errText);
    }
    const idJson = await idRes.json();
    
    console.log('exate token response', { idJson });
    
    
    const token = `${idJson.token_type} ${idJson.access_token}`;
    
    
    //make request to redact data
    const dataURL = EXATE_DATA_URL;
    const dataHeaders = {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Data-Set-Type': 'JSON',
        'X-Resource-Token': token
      };
    
    const dataBody = {
        "countryCode": "US",
        "dataOwningCountryCode": "US",
        "manifestName": context.type,
        "jobType": "Restrict",
        "dataSet": JSON.stringify(context),
        "protectNullValues": true,
        "preserveStringLength": false,
        "snapshotDate": "2021-11-18T00:00:00Z",
        "restrictedText": "*********",
        "matchingRule": {
            "claims": [
                {
                    "attributeName": "ADGroup",
                    "attributeValue": "CRM"
                },
                {
                    "attributeName": "Orchestrator",
                    "attributeValue": "Connectifi"
                }
            ]
        }
    };

        
    const dataRes = await fetch(dataURL, { method: 'POST', headers: dataHeaders, body: JSON.stringify(dataBody)});
    if (!dataRes.ok) {
        const errText = await dataRes.text();
        throw new Error(errText);
    }
    const dataJson = await dataRes.json();
    
    console.log('exate data response', { dataJson });

    return JSON.parse(dataJson.dataSet) as Context;
};

export const exateHook = async (apiKey: string, clientId: string, clientSecret: string, context: Context, destinations: string[]) => {
    const filteredTypes = [ContextTypes.Contact as string, ContextTypes.ContactList as string, ContextTypes.Portfolio as string, ContextTypes.Position as string];
    if (filteredTypes.indexOf(context.type) > -1) {
      const newCtx = await filterContext(apiKey, clientId, clientSecret, context);
      const changes = destinations.map(destination => ({
        destination,
        context: newCtx,
      }));
  
      return awsResponse(200, {changes});
    }
  
    return awsResponse(400, {
      message: 'bad context type',
    });
  };