import React, { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { getDate } from "../../scripts/util";
import TrackerHeader, { CalendarDays } from "./TrackerHeader";
import TrackerHabits from "./TrackerHabits";
import { Habit } from "../../scripts/mongo";
import TrackerDays from "./TrackerDays";

export type DateType = {
  day: number;
  month: number;
  year: number;
};

type TrackerProps = {
  loading: boolean;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
};

const Tracker = (props: TrackerProps) => {
  const [date, setDate] = useState<DateType>();
  const [month, setMonth] = useState<number>();
  
  useEffect(() => {
    const nzDate: Date = getDate();
    const day = nzDate.getDate();
    const m = nzDate.getMonth();
    const year = nzDate.getFullYear();
    setDate({
      day,
      month: m,
      year,
    });
    if (month === undefined) setMonth(m);
  }, []);

  useEffect(() => {
    console.log('tracker loading? ' + props.loading)
    
  }, [date, props.loading, month]);
  return (
    <>
      <div
        className={
          (props.loading ? "hidden " : "") + "flex justify-center pt-24"
        }
      >
        <div className="w-full m-auto mx-10 rounded-lg flex">
          <div className="mx-10 w-full min-w-max bg-white rounded-xl px-20 pt-6 shadow-2xl">
            <TrackerHeader date={date} month={month} setMonth={m => setMonth(m)}/>
            <TrackerHabits date={date} month={month} habits={props.habits} setHabits={props.setHabits} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Tracker;
