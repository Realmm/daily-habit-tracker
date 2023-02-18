import { Habit } from "./mongo";

export const getDate = (): Date => {
  const date = new Date().toLocaleString("en-NZ", {
    timeZone: "Pacific/Auckland",
  });
  const dayDate = date.split(",")[0];
  const split = dayDate.split("/");
  const day = Number.parseInt(split[0]);
  const month = Number.parseInt(split[1]);
  const year = Number.parseInt(split[2]);
  return new Date(year, month, day);
};

export const isInside = (e: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

//Must also modify in NewHabitButton.tsx, exact same function duplicated in there
export const getNextHabitNumber = (habits: Habit[]): number => {
  return habits.length === 0 ? 0 : Math.max(...habits.map(h => h.position)) + 1;
};