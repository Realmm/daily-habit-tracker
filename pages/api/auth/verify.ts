import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import ironSessionApiRoute from "../../../scripts/ironSessionApiRoute";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405);
    res.json({
      message: "Error: Must use POST",
      success: false,
    });
    return;
  }
  const { message, signature } = req.body;
  const siweMessage = new SiweMessage(message);
  try {
    const fields = await siweMessage.validate(signature);
    if (fields.nonce !== req.session.nonce) {
      return res.status(422).json({ message: "Invalid nonce", success: false });
    }
    req.session.siwe = fields;
    await req.session.save();
    res.json({
      message: "Validated successfully",
      address: req.session.siwe.address,
      success: true,
    });
  } catch {
    res.status(400);
    res.json({
      message: "Unable to validate signature",
      success: false,
    });
  }
};

export default ironSessionApiRoute(handler);
