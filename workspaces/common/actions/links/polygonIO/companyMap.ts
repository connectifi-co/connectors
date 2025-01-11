import { ContextTypes } from '@finos/fdc3';
import{ getTickerInfo } from '../../../lib/polygon';
import { createResponse } from '../../../lib/utils';
import { ActionHandler } from '../../../lib/types';

const cleanPostalCode = (code: string): string => {
    if (code) {
        const codeSplit = code.split('-');
        return codeSplit[0];
    }
    return code;
};

export const companyHQ: ActionHandler = async (params) => {
  const {context, keys} = {...params};
  const apiKey = keys?.['apiKey'];
  if (!apiKey){
    return createResponse(400, {
      message: 'api key not found',
    });
  }
  if (context.type === ContextTypes.Instrument) {
    const newCtx = await getTickerInfo(apiKey, context.id?.ticker);
    let url = '';
    console.log(`get address from ${JSON.stringify(newCtx)}`);
    if (newCtx.address){
      const query = encodeURIComponent(`${newCtx.address.address1}, ${newCtx.address.city}, ${newCtx.address.state} ${cleanPostalCode(newCtx.address.postal_code)}`);
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else {
      url = 'https://maps.google.com';
    }
    console.log(`url result: ${url}`);

    return createResponse(200, {url});
  } 

  return createResponse(400, {
    message: 'bad context type',
  });
}