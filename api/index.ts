import app, { connectDB } from "../server";

let isInitialized = false;

export default async (req: any, res: any) => {
  if (!isInitialized) {
    try {
      await connectDB();
    } catch (err) {
      console.error("Vercel entry point: connectDB failed", err);
    }
    isInitialized = true;
  }
  return app(req, res);
};
