import { describe, expect, test } from "@jest/globals";
import { handler as nonce } from "../pages/api/auth/nonce";
import { handler as verify } from "../pages/api/auth/verify";
import { createMocks } from "node-mocks-http";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { handler as me } from "../pages/api/auth/me";
import { handler as logout } from "../pages/api/auth/logout";
import {
  Session,
  startSession,
  testOtherFailingEndpointMethods,
} from "./testCommon";

describe("Web3 connection auth flow", () => {
  let session: Session = {};
  beforeEach(() => {
    session = {};
  })
  testOtherFailingEndpointMethods("auth/nonce", "GET", session, (req, res) =>
    nonce(req, res)
  );
  testOtherFailingEndpointMethods("auth/verify", "POST", session, (req, res) =>
    verify(req, res)
  );
  testOtherFailingEndpointMethods("auth/me", "GET", session, (req, res) =>
    me(req, res)
  );
  testOtherFailingEndpointMethods("auth/logout", "GET", session, (req, res) =>
    logout(req, res)
  );
  test("Can generate new nonce", async () => {
    await generateNonce(session);
  });
  test("Can verify signature", async () => {
    await generateNonceAndVerify(session);
  });
  test("Cannot see address if not signed in", async () => {
    const res = await getMe(session, false);
    const data = res._getJSONData();
    expect(data.address === undefined).toBe(true);
  });
  test("Can see address if signed in", async () => {
    await generateNonceAndVerify(session);
    const res = await getMe(session, false);
    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data.address !== undefined).toBe(true);
    expect(data.address).toBeTruthy();
  });
  test("Can logout", async () => {
    await generateNonceAndVerify(session);
    const meRes = await getMe(session, false);
    const dataRes = meRes._getJSONData();
    expect(dataRes.address !== undefined).toBe(true);

    const { req, res } = createMocks({
      method: "GET",
      session: (session as any).session,
    });
    await logout(req as any, res as any);
    const data = Boolean(res._getData());
    expect(data).toBe(true);
  });
});

const getMe = async (session: Session, beginSession: boolean) => {
  if (beginSession) await startSession(session);

  const { req, res } = createMocks({
    method: "GET",
    session: session.session,
  });
  await me(req as any, res as any);
  return res;
};

export const provider = ethers.Wallet.createRandom();

export const generateNonceAndVerify = async (
  session: Session
): Promise<Session> => {
  const s = await generateNonce(session);
  const getMessage = async () => {
    const siwe = new SiweMessage({
      domain: "localhost",
      uri: "https://localhost",
      address: await provider.getAddress(),
      statement: "Test message",
      version: "1",
      chainId: 1,
      nonce: (s.session as any).nonce,
    });
    return siwe.prepareMessage();
  };
  const message = await getMessage();
  const signature = await provider.signMessage(message);
  const { req, res } = createMocks({
    method: "POST",
    body: {
      message: message,
      signature: signature,
    },
    session: s.session,
  });
  await verify(req as any, res as any);
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData()).success).toBeTruthy();
  return s;
};

const generateNonce = async (session: Session): Promise<Session> => {
  await startSession(session);
  const { req, res } = createMocks({
    method: "GET",
    session: session.session,
  });
  await nonce(req as any, res as any);
  expect(res._getStatusCode()).toBe(200);
  expect(res._getData()).toBeTruthy();
  return session;
};
