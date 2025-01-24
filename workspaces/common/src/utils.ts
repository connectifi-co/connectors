export const cleanPostalCode = (code: string): string => {
  if (code) {
    const codeSplit = code.split('-');
    return codeSplit[0];
  }
  return code;
};
