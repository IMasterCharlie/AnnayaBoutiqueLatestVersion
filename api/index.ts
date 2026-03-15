import app, { startServer } from "../server";

let isInitialized = false;

export default async (req: any, res: any) => {
  if (!isInitialized) {
    await startServer();
    isInitialized = true;
  }
  return app(req, res);
};
