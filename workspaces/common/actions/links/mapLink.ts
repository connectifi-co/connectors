import { Location } from '../../types';
import { createResponse } from '../../utils';
import { ActionHandler } from '../../types';

const cleanPostalCode = (code: string): string => {
  if (code) {
    const codeSplit = code.split('-');
    return codeSplit[0];
  }
  return code;
};

export const mapLink: ActionHandler = async (params) => {
  const { context } = { ...params };
  const location = context as Location;

  if (location.id.geo) {
    const url = `https://maps.google.com/?q=${location.id.geo.lat},${location.id.geo.long}`;
    return createResponse(200, { url });
  }
  const address = location.id.address;
  const street = address.street ? address.street[0] : '';
  const query = encodeURIComponent(
    `${street}, ${address.city || ''}, ${address.state || ''} ${cleanPostalCode(address.code || '')} ${address.country || ''}`,
  );
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  return createResponse(200, { url });
};
