import type { Context } from '@finos/fdc3';
import { EXATE_ID_URL, EXATE_DATA_URL } from '../lib/constants';
import { DeliveryHookHandler } from '../lib/types';
import { createResponse } from '../lib/utils';

interface HookItem {
  destination: string;
  context: Context;
};

const filterContext = async (apiKey: string, clientId: string, clientSecret: string, destinationId: string, context : Context) : Promise<Context> => {

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
        "snapshotDate": "2021-11-18T00:00:00Z", //don't need
        "dataUsageId": 321, //'Legitimate Use' code
        "restrictedText": "*********",
        "matchingRule": {
            "claims": [
                {
                  "attributeName": "Orchestrator",
                  "attributeValue": "ExateDemo"
                },
                {
                    "attributeName": "destinationId",
                    "attributeValue": destinationId
                }
            ]
        }
    };
    console.log('exate data request', JSON.stringify(dataBody));
    const dataRes = await fetch(dataURL, { method: 'POST', headers: dataHeaders, body: JSON.stringify(dataBody)});
    if (!dataRes.ok) {
        const errText = await dataRes.text();
        throw new Error(errText);
    }
    const dataJson = await dataRes.json();
    
    console.log('exate data response', { dataJson });

    return JSON.parse(dataJson.dataSet) as Context;
};

export const exateHook: DeliveryHookHandler = async (params) => {
  const {keys, context, destinations} = {...params};
      const changes: Array<HookItem> = [];
      const apiKey = keys && keys["apiKey"];
      const clientId = keys && keys["clientId"];
      const clientSecret = keys && keys["clientSecret"];
      if (!apiKey || ! clientId || !clientSecret){
        return createResponse(400, {
          message: 'api keys not found',
        });
      }
      for (let destinationId  of destinations) {
        const newCtx = await filterContext(apiKey, clientId, clientSecret, destinationId, context);
        changes.push({
            destination: destinationId,
            context: newCtx
          } as HookItem);
      }
  
      return createResponse(200, {changes});
  };