import { NextApiRequest, NextApiResponse } from "next";
import ironSessionApiRoute from "../../../scripts/ironSessionApiRoute";
import { Habit, getHabits, getNextHabitNumberFromAddress, setHabits } from "../../../scripts/mongo";
import { randomUUID } from "crypto";

//CRUD
//Can create a habit (if signed in, habit name, at /api/tracker/habit), returns success and habit id
//Can read a habit with dynamic route (if signed in, at /api/tracker/habit/habitId), give habit id, returns habit name and habits tracked
//Can update a habit if signed in at /api/tracker/habit by sending update request, with habit id and new habit name, returns success boolean
//Can delete a habit if signed in at /api/tracker/habit by sending a delete request, with habit id, returns success boolean

/*
GET:
    Expect: nothing
    Return: {
    habits
    }
PUT:
    Expect: {
        name: string
    }
    Return: {
        id: string
    }
    Error: false
PATCH:
    Expect: {
        id: string,
        name: string
    }
    Return: boolean
DELETE:
    Expect: {
        id: string
    }
    Return: boolean
Error: false
*/

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const address = req.session?.siwe?.address;
  if (address === undefined) {
    res.status(401);
    res.send(false);
    return;
  }
  try {
    if (req.method === "GET") return res.json(await getHabits(address));
    if (req.method === "PUT") {
      const { name } = req.body;
      const id = await create(address, name);
      if (id === undefined) {
        res.status(400);
        res.send(false);
        return;
      }
      res.json({
        id,
      });
      return;
    }
    
    res.status(405);
    res.json({
      message: "Error: Must use PUT, PATCH or DELETE",
      success: false,
    });
  } catch (e: any) {
    res.status(400);
    res.send(false);
  }
};

/*
{
    {
        id: address,
        habits: [{
            id: uuid,
            name: 'walk dog'
            days: {[
              day: 1
              month: 2
              year: 2023
              success: boolean 
            ]}
        }]
    }
}
*/

const create = async (
  address: string,
  name: string
): Promise<string | undefined> => {
  const habits = await getHabits(address);
  let uuid = randomUUID();
  while (habits.some((h) => h.id === uuid)) {
    uuid = randomUUID();
  }
  habits.push({
    position: await getNextHabitNumberFromAddress(address),
    id: uuid,
    name,
  });
  const updated = await setHabits(address, habits);
  return updated ? uuid : undefined;
};



export default ironSessionApiRoute(handler);
