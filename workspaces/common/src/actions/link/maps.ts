import type { LinkActionHandler } from '@connectifi/sdk';
import { ContextTypes, type Location, RequestError } from '../../types';
import { cleanPostalCode } from '../../utils';

export const mapLink: LinkActionHandler = async (params) => {
  const { context } = { ...params };
  if (context.type !== ContextTypes.Location) {
    throw new RequestError('context type not supported');
  }

  let url: string;
  const location = context as Location;
  if (location.id.geo) {
    url = `https://maps.google.com/?q=${location.id.geo.lat},${location.id.geo.long}`;
  } else {
    const address = location.id.address;
    const street = address.street ? address.street[0] : '';
    const query = encodeURIComponent(
      `${street}, ${address.city || ''}, ${address.state || ''} ${cleanPostalCode(address.code || '')} ${address.country || ''}`,
    );
    url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  return { url };
};
