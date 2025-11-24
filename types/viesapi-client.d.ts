declare module "viesapi-client" {
  export default class VIESAPI {
    constructor(apiKey: string, apiSecret: string);
    getVIESData(vatNumber: string): Promise<any>;
    getVIESDataExt(vatNumber: string): Promise<any>;
    getVIESDataFull(vatNumber: string): Promise<any>;
    getVIESDataSync(vatNumber: string): any;
  }
}
