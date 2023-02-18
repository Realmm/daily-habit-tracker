import { NextApiHandler } from "next";
import { withIronSessionApiRoute } from "iron-session/next";

export default function ironSessionApiRoute(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, {
        cookieName: 'siwe', 
        password: process.env.IRON_SESSION_PASSWORD as string,
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production'
        }
    })
}