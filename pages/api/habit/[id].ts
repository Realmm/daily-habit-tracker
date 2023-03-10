import { NextApiRequest, NextApiResponse } from "next";
import ironSessionApiRoute from "../../../scripts/ironSessionApiRoute";
import { getHabit, getHabits, setHabits } from "../../../scripts/mongo";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const address = req.session?.siwe?.address;
  if (
    req.method !== "PATCH" &&
    req.method !== "DELETE" &&
    req.method !== "GET" &&
    req.method !== "POST"
  ) {
    res.status(405);
    res.json({
      message: "Error: Must use GET, PATCH, POST or DELETE",
      success: false,
    });
    return;
  }
  if (address === undefined) {
    res.status(401);
    res.send(false);
    return;
  }

  if (req.query.id === undefined || typeof req.query.id !== "string") {
    res.status(400);
    res.send(false);
    return;
  }
  const id = req.query.id as string;
  try {
    const day = req.body?.day;
    const dayDate: Day | undefined =
      day === undefined
        ? undefined
        : {
            date: {
              day: day.day,
              month: day.month,
              year: day.year
            },
            success: day.success === undefined ? undefined : day.success,
          };
    if (req.method === "POST") {
      const name: string | undefined = req.body?.name;
      const position: number | undefined = req.body?.position;
      const success = await update(address, id, name, dayDate, position, true);
      if (!success) res.status(400);
      res.send(success);
      return;
    }
    if (req.method === "PATCH") {
      const name: string | undefined = req.body?.name;
      const position: number | undefined = req.body?.position;
      const success = await update(address, id, name, dayDate, position, false);
      if (!success) res.status(400);
      res.send(success);
      return;
    }
    if (req.method === "DELETE") {
      const success = await del(address, id, dayDate);
      if (!success) res.status(400);
      res.send(success);
      return;
    }
    if (req.method === "GET") {
      if (id === undefined) {
        res.status(400);
        res.send(false);
      }
      res.json(await getHabit(address, id));
      return;
    }
  } catch (e: any) {
    res.status(400);
    res.send(false);
  }
};

type Day = {
  date: {
    day: number,
    month: number,
    year: number
  };
  success: boolean | undefined;
};

const update = async (
  address: string,
  id: string,
  name: string | undefined,
  day: Day | undefined,
  position: number | undefined,
  addDay: boolean
): Promise<boolean> => {
  const habits = await getHabits(address);
  const habit = habits.find((h) => h.id === id);
  if (habit === undefined) return false;
  const habitsWithoutOldHabit = habits.filter((h) => h.id !== id);
  let days = (habit as any)?.days === undefined ? [] : (habit as any)?.days;
  if (day !== undefined) {
    if (addDay) {
      days.push({
        day: day.date.day,
        month: day.date.month,
        year: day.date.year,
        success: day.success,
      });
    } else {
      const foundDay = days.find(
        (d: any) =>
          d.day === day.date.day &&
          d.month === day.date.month &&
          d.year === day.date.year
      );
      if (!foundDay) return false;
      const daysWithoutFoundDay = days.filter(
        (d: any) =>
          d.day !== foundDay.day ||
          d.month !== foundDay.month ||
          foundDay.year !== foundDay.year
      );
      daysWithoutFoundDay.push({
        day: foundDay.day,
        month: foundDay.month,
        year: foundDay.year,
        success: day.success,
      });
      days = daysWithoutFoundDay;
    }
  }
  const updatedHabit = {
    position: position === undefined ? habit.position : position,
    id,
    name: name === undefined ? habit.name : name,
    days: day === undefined ? habit.days : days,
  };
  habitsWithoutOldHabit.push(updatedHabit);
  return setHabits(address, habitsWithoutOldHabit);
};

const del = async (
  address: string,
  id: string,
  day: Day | undefined
): Promise<boolean> => {
  const habits = await getHabits(address);
  const habit = habits.find((h) => h.id === id);
  const habitsWithoutOldHabit = habits.filter((h) => h.id !== id);
  if (habit === undefined) return false;
  if (day === undefined) return setHabits(address, habitsWithoutOldHabit);
  const days = (habit as any)?.days;
  const daysWithoutDay = days.filter(
    (d: any) =>
      d.day !== day.date.day ||
      d.month !== day.date.month ||
      d.year !== day.date.year
  );
  (habit as any).days = daysWithoutDay;
  habitsWithoutOldHabit.push(habit);
  return setHabits(address, habitsWithoutOldHabit);
};

export default ironSessionApiRoute(handler);
