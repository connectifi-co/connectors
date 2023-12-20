const invokeHook = async (url: string, filePath: string) => {
  const hookPayload = {
    context: {
      type: "fdc3.instrument",
      id: {
        ticker: "TSLA",
      }
    },
    destinations: [
      {
        appId: 'newsAPI',
      }
    ],
    source : {}
  }
  const hookHeaders = {
    "content-type" : "application/json"
  };
  try {
    const resp = await fetch(url, { method: 'POST', body: JSON.stringify(hookPayload), headers: hookHeaders});
    const json = await resp.json();
    console.log('response', JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }

}

const hookUrl = process.argv[2];
const dateFile = process.argv[3];

if (hookUrl && dateFile) {
  const json = invokeHook(hookUrl, '');
  console.log(JSON.stringify(json, null, 2));
} else {
  console.log('usage: ts-node generate.ts <provider> <context type> <context id keys>');
}
