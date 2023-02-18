import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce, SiweMessage } from "siwe";
import ironSessionApiRoute from "../../../scripts/ironSessionApiRoute";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405);
    res.json({
      message: "Error: Must use GET",
      success: false,
    });
    return;
  }
  const nonce = generateNonce();
  res.setHeader("Content-Type", "text/plain");
  req.session.nonce = nonce;
  await req.session.save();
  res.send(req.session.nonce);
};

export default ironSessionApiRoute(handler);
