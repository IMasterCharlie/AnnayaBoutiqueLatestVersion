import app, { connectDB } from "../server";

let isInitialized = false;

export default async (req: any, res: any) => {
  if (!isInitialized) {
    await connectDB();
    isInitialized = true;
  }
  return app(req, res);
};
