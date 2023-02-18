import React, { useEffect, useState } from "react";
import { DateType } from "./Tracker";
import { getDaysInMonth } from "./TrackerHeader";
import { AiOutlineClose } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import { Habit } from "../../scripts/mongo";
import { getDate } from "../../scripts/util";

type TrackerDaysProps = {
  date: DateType | undefined;
  habit: Habit;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  month: number | undefined;
};

type DayView = {
  day: number;
  month: number;
  year: number;
  success: boolean | undefined;
};

const TrackerDays = (props: TrackerDaysProps) => {
  const [days, setDays] = useState<JSX.Element[] | undefined>();

  useEffect(() => {
    if (!props.month) return;
    const daysInMonth = getDaysInMonth(props.month);
    const date = getDate();
    const elements = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const day = props.habit.days?.find(
        (d: any) => d.day === i && d.month === props.month
      );
      elements.push(
        <TrackerDay
          habits={props.habits}
          dayView={{
            day: i,
            month: props.month,
            year: date.getUTCFullYear(),
            success: day?.success === null ? undefined : day?.success,
          }}
          setHabits={props.setHabits}
          habit={props.habit}
          date={props.date}
          key={i}
        />
      );
    }
    setDays(elements);
  }, [props]);

  return (
    <div
      style={{
        minWidth: "60rem",
        width: "80%",
      }}
      className="border-r-2 border-gray-300 flex"
    >
      {days}
    </div>
  );
};

type TrackerDayProps = {
  dayView: DayView;
  habit: Habit;
  date: DateType | undefined;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
};

const TrackerDay = (props: TrackerDayProps) => {
  const [done, setDone] = useState(false);
  const [notDone, setNotDone] = useState(false);

  const updateDay = async (oldSuccess: boolean | undefined) => {
    if (props.habit.id === undefined) return;
    const oldDays = props.habit.days === undefined ? [] : props.habit.days;
    const habit = props.habit;
    const habitsWithoutOldHabit = props.habits.filter(
      (h) => h.id !== props.habit.id
    );
    const updatedDays = oldDays.filter((d: any) => d.day !== props.dayView.day);
    updatedDays.push({
      day: props.dayView.day,
      month: props.dayView.month,
      year: props.dayView.year,
      success: oldSuccess === undefined ? true : oldSuccess ? false : undefined,
    });
    const newHabit = {
      position: habit.position,
      id: habit.id,
      name: habit.name,
      days: updatedDays,
    } as Habit;
    habitsWithoutOldHabit.push(newHabit);
    props.setHabits(habitsWithoutOldHabit);

    if (oldSuccess === undefined) {
      setDone(true);
      setNotDone(false);
    } else {
      if (oldSuccess) {
        setDone(false);
        setNotDone(true);
      } else {
        setDone(false);
        setNotDone(false);
      }
    }
    const revert = () => {
      if (oldSuccess === undefined) {
        setDone(false);
        setNotDone(false);
        return;
      }
      if (oldSuccess) {
        setDone(true);
        setNotDone(false);
      } else {
        setDone(false);
        setNotDone(true);
      }
    };

    if (!props.habit.id) {
      revert();
      return;
    }
    let r: any | undefined;
    const newSuccess =
      oldSuccess === undefined ? true : oldSuccess ? false : undefined;

    const newDayView = {
      day: props.dayView.day,
      month: props.dayView.month,
      year: props.dayView.year,
      success: newSuccess,
    };
    const body = JSON.stringify({
      day: newDayView
    });
    const headers = { "Content-Type": "application/json" };
    const habitRes = await fetch(`/api/habit/${props.habit.id}`, {
      method: "GET",
    });
    if (!habitRes.ok) return;
    const dbHabit = await habitRes.json();
    const day = dbHabit.days?.find((d: any) => d.day === props.dayView.day);
    if (day === undefined) {
      r = await fetch(`/api/habit/${props.habit.id}`, {
        method: "POST",
        headers,
        body,
      });
    }

    if (r !== undefined && !r.ok) {
      revert();
      return;
    }
    const res = await fetch(`/api/habit/${props.habit.id}`, {
      method: "PATCH",
      headers,
      body,
    });
    if (!res.ok) revert();
  };

  const clickedButton = async () => {
    if (!done && !notDone) {
      await updateDay(undefined);
      return;
    }
    await updateDay(done);
  };

  useEffect(() => {
    const success = props.dayView.success;
    if (success === undefined) {
      setDone(false);
      setNotDone(false);
      return;
    }
    setDone(success);
    setNotDone(!success);
  }, []);

  useEffect(() => {
    const day = props.habit.days?.find(
      (d: any) => d.day === props.dayView.day && d.month === props.dayView.month
    );
    if (
      day === undefined ||
      day.success === null ||
      day.success === undefined
    ) {
      if (done) setDone(false);
      if (notDone) setNotDone(false);
      return;
    }
    if (done !== day.success) setDone(day.success);
    if (notDone !== !day.success) setNotDone(!day.success);
  }, [done, notDone, props.dayView.success]);

  return (
    <>
      <button
        onClick={clickedButton}
        className={
          (getDaysInMonth(props.dayView.month) === props.dayView.day
            ? ""
            : "border-r-2 ") +
          (done ? "bg-green-400 " : notDone ? "bg-red-400 " : "") +
          "w-full"
        }
      >
        <div className={notDone ? "flex justify-center" : "hidden"}>
          <AiOutlineClose size={16} />
        </div>
        <div className={done ? "flex justify-center" : "hidden"}>
          <TiTick size={20} />
        </div>
      </button>
    </>
  );
};

export default TrackerDays;
