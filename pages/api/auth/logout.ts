import { NextApiRequest, NextApiResponse } from "next";
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
  req.session.destroy();
  res.send(true);
};

export default ironSessionApiRoute(handler);