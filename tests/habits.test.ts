import { describe, test } from "@jest/globals";
import {
  Session,
  startSession,
  testFailingEndpointMethods,
} from "./testCommon";
import { handler as habitHandler } from "../pages/api/habit/index";
import { handler as habitIdHandler } from "../pages/api/habit/[id]";
import { createMocks } from "node-mocks-http";
import { generateNonceAndVerify, provider } from "./web3.test";
import { close, deleteAllHabits } from "../scripts/mongo";

describe("Habit CRUD flow works", () => {
  let session: Session = {};
  let id: any | undefined;
  beforeEach(async () => {
    session = {};
    await startSession(session);
    session = await generateNonceAndVerify(session);
  });
  afterEach(async () => {
    if (id !== undefined) await deleteHabit(session, id);
  });
  afterAll(async () => {
    const address = await provider.getAddress();
    await deleteAllHabits(address);
    await close();
  });
  testFailingEndpointMethods(
    "habit/randomHabitId",
    ["PUT"],
    session,
    (req, res) => habitIdHandler(req, res)
  );
  test("Can create a habit", async () => {
    id = await createHabit(session);
  });
  test("Can delete a habit", async () => {
    id = await createHabit(session);
    const id2 = await createHabit(session);
    await deleteHabit(session, id2);
  });
  test("Habit positions go up by 1", async () => {
    id = await createHabit(session);
    const id2 = await createHabit(session);

    const habits = await getHabits(session);
    const sorted = habits.sort((h1: any, h2: any) => h1.position > h2.position ? 1 : -1);
    expect(sorted.length).toBeGreaterThanOrEqual(2);

    let position = 0;
    for (let i = 0; i < sorted.length; i++) {
      const habit = sorted[i];
      expect(habit.position === position).toBe(true);
      position++;
    }

    await deleteHabit(session, id2);
  });
  test("Can update a habits position", async () => {
    id = await createHabit(session);
    const { req, res } = createMocks({
      method: "PATCH",
      session: session.session,
      body: {
        position: 3
      },
      query: {
        id,
      },
    });
    await habitIdHandler(req as any, res as any);
    const data = res._getJSONData();
    expect(data).toBe(true);
    expect(res._getStatusCode()).toBe(200);
    const habits = await getHabits(session);
    const habit = habits.find((h: any) => h.id === id)
    expect(habit !== undefined).toBe(true);
    expect(typeof habit.position).toBe('number')
    expect(habit.position).toBe(3)
  })
  test("Can read a habit from the habit id", async () => {
    id = await createHabit(session);
    const { req, res } = createMocks({
      method: "GET",
      session: session.session,
      query: {
        id,
      },
    });
    await habitIdHandler(req as any, res as any);
    const data = res._getJSONData();
    expect(data.name).toBeTruthy();
    expect(typeof data.position).toBe('number')
    expect(res._getStatusCode()).toBe(200);
  });
  test("Can read all habits for an address", async () => {
    id = await createHabit(session);
    const data = await getHabits(session);

    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data[0].name !== undefined).toBe(true);
    expect(data[0].position !== undefined).toBe(true);
  });
  test("Can update a habit with a new name", async () => {
    id = await createHabit(session);
    const { req, res } = createMocks({
      method: "PATCH",
      session: session.session,
      body: {
        name: "newName",
      },
      query: {
        id,
      },
    });
    await habitIdHandler(req as any, res as any);
    const data = res._getJSONData();
    expect(data).toBe(true);
    expect(res._getStatusCode()).toBe(200);
  });
  test("Can create a day", async () => {
    id = await createHabit(session);
    await createDay(session, id);
  });
  test("Can read all days for a habit", async () => {
    id = await createHabit(session);
    await createDay(session, id);
    await getDays(id, session, true);
  });
  test("Can update a day", async () => {
    id = await createHabit(session);
    await createDay(session, id);
    const { req, res } = createMocks({
      method: "PATCH",
      session: session.session,
      body: {
        day: {
          day: 9,
          month: 2,
          year: 2023,
          success: false,
        },
      },
      query: {
        id,
      },
    });
    await habitIdHandler(req as any, res as any);
    expect(res._getJSONData()).toBe(true);
    expect(res._getStatusCode()).toBe(200);
  });
  test("Can delete a day", async () => {
    id = await createHabit(session);
    await createDay(session, id);
    const days = await getDays(id, session, true);
    expect(days.length).toBeGreaterThanOrEqual(1);
    const { req, res } = createMocks({
      method: "DELETE",
      session: session.session,
      body: {
        day: {
          day: 9,
          month: 2,
          year: 2023,
        },
      },
      query: {
        id,
      },
    });
    await habitIdHandler(req as any, res as any);
    expect(res._getJSONData()).toBe(true);
    expect(res._getStatusCode()).toBe(200);
    expect((await getDays(id, session, false)).length).toBe(0);
  });
});

const getHabits = async (session: Session): Promise<any> => {
  const { req, res } = createMocks({
    method: "GET",
    session: session.session,
  });
  await habitHandler(req as any, res as any);
  const data = res._getJSONData();
  expect(res._getStatusCode()).toBe(200);
  return data;
};

const getDays = async (
  id: string,
  session: Session,
  confirmNotEmpty: boolean
) => {
  const { req, res } = createMocks({
    method: "GET",
    session: session.session,
    query: {
      id,
    },
  });
  await habitIdHandler(req as any, res as any);
  const data = res._getJSONData();
  if (confirmNotEmpty) {
    expect(data.days.length).toBeGreaterThanOrEqual(1);
    expect(data.days[0].day).toBeTruthy();
    expect(data.days[0].month).toBeTruthy();
    expect(data.days[0].year).toBeTruthy();
    expect(typeof data.days[0].success).toBe("boolean");
  }

  expect(res._getStatusCode()).toBe(200);
  return data.days;
};

const createDay = async (session: Session, id: string) => {
  const { req, res } = createMocks({
    method: "POST",
    session: session.session,
    body: {
      day: {
        day: 9,
        month: 2,
        year: 2023,
        success: true,
      },
    },
    query: {
      id,
    },
  });
  await habitIdHandler(req as any, res as any);
  const data = res._getJSONData();
  expect(data).toBe(true);
  expect(res._getStatusCode()).toBe(200);
};

const deleteHabit = async (session: Session, id: string) => {
  const { req, res } = createMocks({
    method: "DELETE",
    session: session.session,
    query: {
      id,
    },
  });
  await habitIdHandler(req as any, res as any);
  expect(Boolean(res._getData())).toBe(true);
  expect(res._getStatusCode()).toBe(200);
};

const createHabit = async (session: Session) => {
  const { req, res } = createMocks({
    method: "PUT",
    session: session.session,
    body: {
      name: "testName",
    },
  });
  await habitHandler(req as any, res as any);
  const data = res._getJSONData();
  expect(data.id).toBeTruthy();
  expect(res._getStatusCode()).toBe(200);
  return data.id;
};
