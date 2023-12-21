import { readFileSync } from 'fs';

const getIt = async (hookUrl: string, dataFilePath: string) => {
  const dataFile = readFileSync(dataFilePath);
  const hookPayload = JSON.parse(dataFile.toString());
  const hookHeaders = {
    "content-type" : "application/json"
  };
  try {
    const resp = await fetch(hookUrl, { method: 'POST', body: JSON.stringify(hookPayload), headers: hookHeaders});
    const json = await resp.json();
    console.log('hook response:\n', JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }
}

const hookUrl = process.argv[2];
const dataFile = process.argv[3];

if (hookUrl && dataFile) {
  getIt(hookUrl, dataFile)
} else {
  console.log('usage: ts-node generate.ts <provider> <context type> <context id keys>');
}
