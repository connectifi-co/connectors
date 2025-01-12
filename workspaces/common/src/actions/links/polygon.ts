import { ContextTypes } from '@finos/fdc3';
import { getTickerInfo } from '../../polygon';
import { LinkActionHandler, RequestError, ServerError } from '../../types';
import { cleanPostalCode } from '../../utils';

const apiKey = process.env.POLYGON_API_KEY;

export const companyHQLink: LinkActionHandler = async (request) => {
  if (!apiKey) {
    throw new ServerError('polygon api key missing');
  }

  const { context } = request;
  if (context.type !== ContextTypes.Instrument) {
    throw new RequestError('context type not supported');
  }

  if (context.type === ContextTypes.Instrument) {
    const newCtx = await getTickerInfo(apiKey, context.id?.ticker);
    let url = '';
    console.log(`get address from ${JSON.stringify(newCtx)}`);
    if (newCtx.address) {
      const query = encodeURIComponent(
        `${newCtx.address.address1}, ${newCtx.address.city}, ${newCtx.address.state} ${cleanPostalCode(newCtx.address.postal_code)}`,
      );
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else {
      url = 'https://maps.google.com';
    }
    console.log(`url result: ${url}`);
    return { url };
  }
};
