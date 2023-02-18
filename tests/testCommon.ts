import each from "jest-each";
import { NextApiRequest, NextApiResponse } from "next";
import { RequestMethod, createMocks } from "node-mocks-http";
import { MockIronStore, applySession } from "./mockSession";

export type Session = {
  session?: MockIronStore;
};

export const startSession = async (session: Session) => {
  await applySession(session, undefined, {
    cookieName: "test",
    password: "test",
  });
  if (!session.session) throw new Error("No session after apply session");
};

export const testFailingEndpointMethods = (
  name: string,
  endpoints: RequestMethod[],
  session: Session,
  func: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  each(endpoints).test(
    "Unable to call with %s method for /api/" + name + " endpoint",
    (method: RequestMethod) => {
      expect405(method, session, (req, res) => func(req, res));
    }
  );
};

export const testOtherFailingEndpointMethods = (
  name: string,
  endpoint: RequestMethod,
  session: Session,
  func: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  const allEndpoints = [
    "DELETE",
    "PATCH",
    "POST",
    "PUT",
    "GET",
  ] as RequestMethod[];
  const errorEndpoints = allEndpoints.filter((e) => e !== endpoint);
  testFailingEndpointMethods(name, errorEndpoints, session, func);
};

const expect405 = async (
  method: RequestMethod,
  session: Session,
  func: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  const { req, res } = createMocks({
    method,
    session,
  });
  await func(req as any, res as any);
  const data = res._getJSONData();
  expect(data.success !== true).toBe(true);
  expect(res._getStatusCode()).toBe(405);
  return;
};
