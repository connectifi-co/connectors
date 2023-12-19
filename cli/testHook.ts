import { createHookInput } from "./utils";

const testHook = async (hookUrl:string) => {
  const hookPayload = createHookInput('asdf');
  const hookHeaders = {
    "content-type" : "application/json"
  };
  try {
    const resp = await fetch(hookUrl, { method: 'POST', body: JSON.stringify(hookPayload), headers: hookHeaders});
    const json = await resp.json();
    console.log('response', JSON.stringify(json, null, 2));
  } catch(e) {
    console.error(e);
  }
}

if (process.argv[2]) {
  testHook(process.argv[2])
    .then(() => console.log('done'))
    .catch(console.error);
} else {
  console.log('Must provide the hook url');
}
