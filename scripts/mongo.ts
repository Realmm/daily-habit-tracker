import { MongoClient, Db } from "mongodb";
import { getNextHabitNumber } from "./util";

const uri = process.env.NEXT_PUBLIC_ATLAS_URI as string;
const client = new MongoClient(uri);

const testing = true;
const testDb = "test-db";
const mainDb = "main-db";

let connectedClient: MongoClient | undefined = undefined;

export const close = async () => {
  await connectedClient?.close();
};

export const habitColl = async () => {
  if (connectedClient === undefined) connectedClient = await client.connect();
  const database = connectedClient.db(testing ? testDb : mainDb);
  return database.collection("habits");
};

export type Habit = {
  position: number;
  id: string;
  name: string;
  days?: any;
};

export const deleteAllHabits = async (address: string): Promise<boolean> => {
  const c = await habitColl();
  const r = await c.deleteOne({
    id: address,
  });
  return r.acknowledged;
};

export const getHabit = async (
  address: string,
  id: string
): Promise<Habit | undefined> => {
  const c = await habitColl();
  const habits = (
    (await c.findOne({
      id: address,
    })) as any
  ).habits as Habit[];
  return habits.find((h) => h.id === id);
};

export const getNextHabitNumberFromAddress = async (
  address: string
): Promise<number> => {
  const habits = await getHabits(address);
  return getNextHabitNumber(habits);
};

export const getHabits = async (address: string): Promise<Habit[]> => {
  const c = await habitColl();
  const r = await c.findOne({
    id: address,
  });
  const habits = (r as any)?.habits;
  return habits === undefined ? [] : habits;
};

export const setHabits = async (
  address: string,
  habits: Habit[]
): Promise<boolean> => {
  const c = await habitColl();
  console.log('a4')
  console.log(address)
  console.log('a4a')
  console.log(habits)
  console.log('a4b')
  const res = await c.updateOne(
    {
      id: address,
    },
    {
      $set: {
        habits,
      },
    },
    {
      upsert: true,
    }
  );
  console.log('a5')
  console.log(res.acknowledged)
  console.log('a6')
  return res.acknowledged;
};
