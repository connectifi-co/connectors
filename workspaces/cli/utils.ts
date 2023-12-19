export const createInstrumentContext = (ticker: string) => {
  return {
    type: "fdc3.instrument",
    id: {
      ticker,
    }
  }
}

export const defaultContext = createInstrumentContext('MSFT');

export const createHookInput = (source:string='sourceApp', context:any=defaultContext, destinations:string[]=['appOne', 'appTwo']) => {
  return {
    source,
    context,
    destinations,
  }
}