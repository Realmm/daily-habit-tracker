import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Habit } from "../../scripts/mongo";
import { NewHabitButton } from "../NewHabitButton";
import { FaBars } from "react-icons/fa";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import Popup from "../Popup";
import TrackerDays from "./TrackerDays";
import { DateType } from "./Tracker";
import { isInside } from "../../scripts/util";

type TrackerHabitsProps = {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  date: DateType | undefined;
  month: number | undefined;
};

const TrackerHabits = (props: TrackerHabitsProps) => {
  const [habits, setHabits] = useState<JSX.Element[]>();

  useEffect(() => {
    const elements = [];
    for (let i = 0; i < props.habits.length; i++) {
      const habit = props.habits[i];
      elements.push(
        <Habit
          month={props.month}
          habit={habit}
          key={i}
          date={props.date}
          habits={props.habits}
          setHabits={props.setHabits}
        />
      );
    }
    setHabits([...elements]);
  }, [props.habits, props.month]);

  useEffect(() => {}, [habits]);

  return (
    <>
      <div className="border-gray-300 pb-20 w-full">
        {habits}
        <NewHabitButton habits={props.habits} setHabits={props.setHabits} />
      </div>
    </>
  );
};

type HabitProps = {
  habit: Habit;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  date: DateType | undefined;
  month: number | undefined;
};

const Habit = (props: HabitProps) => {
  const habitRef = useRef(null);
  const hoverRef = useRef(null);
  const editRef = useRef(null);
  const deleteRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (habitRef === null) return;
      const rect = (habitRef.current as any)?.getBoundingClientRect();
      const rect2 = (hoverRef.current as any)?.getBoundingClientRect();
      if (rect === undefined && rect2 === undefined) return;
      const x = e.clientX;
      const y = e.clientY;
      const isInside = (rect: any) => {
        const insideX = x >= rect.x && x <= rect.x + rect.width;
        const insideY = y >= rect.y && y <= rect.y + rect.height;
        return insideX && insideY;
      };
      let inside = false;
      if (rect.width === 0 || rect.height === 0) {
        inside = isInside(rect2);
      } else {
        inside = isInside(rect);
      }
      if (inside) {
        setHover(true);
        return;
      } else {
        setHover(false);
        return;
      }
    };
    window.addEventListener("mouseover", onMove);
    return () => {
      window.removeEventListener("mouseover", onMove);
    };
  }, []);

  useEffect(() => {}, [hover, editOpen, deleteOpen, props]);

  return (
    <>
      <div
        className={
          (props.habit.name === "" ? "hidden " : "") +
          "w-full border-b-2 flex justify-center h-max break-words"
        }
      >
        <div
          style={{
            minWidth: "15rem",
            width: "20%",
          }}
          className="w-full h-full flex justify-center border-r-2 border-gray-300"
        >
          <div className="w-full h-full">
            <div className="min-h-fit h-full w-full flex justify-center">
              <div
                ref={habitRef}
                className={hover ? "hidden" : "my-auto w-full px-4 py-2"}
              >
                <span className="w-60">{props.habit.name}</span>
              </div>
              <div
                ref={hoverRef}
                className={
                  (hover ? "" : "hidden ") +
                  "w-full bg-gray-200 flex justify-between h-full py-2"
                }
              >
                <button
                  ref={editRef}
                  onClick={() => setEditOpen(true)}
                  className="m-auto"
                >
                  <BsPencilFill size={18} />
                </button>
                <button
                  ref={deleteRef}
                  onClick={() => setDeleteOpen(true)}
                  className="m-auto"
                >
                  <BsTrashFill size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <TrackerDays
          month={props.month}
          habits={props.habits}
          habit={props.habit}
          setHabits={props.setHabits}
          date={props.date}
        />
      </div>
      <Popup
        submitText="Save"
        invalidRefs={[editRef]}
        close={() => setEditOpen(false)}
        open={editOpen}
        onSubmit={(e) =>
          onEditSubmit(e, props.habit.id, props.habits, props.setHabits)
        }
        title={"Editing habit (" + props.habit.name + ")"}
        fields={[
          { id: "name", placeholder: "Eg. Exercise", title: "New Habit Name" },
        ]}
      />
      <Popup
        submitText="Delete"
        invalidRefs={[deleteRef]}
        close={() => setDeleteOpen(false)}
        open={deleteOpen}
        onSubmit={(e) =>
          onDeleteSubmit(props.habit.id, props.habits, props.setHabits)
        }
        title={
          "Are you sure you want to delete the habit '" +
          props.habit.name +
          "'?"
        }
        fields={[]}
      />
    </>
  );
};

const onDeleteSubmit = async (
  habitId: string,
  habits: Habit[],
  setHabits: (habits: Habit[]) => void
) => {
  const oldHabits = habits;
  const habitsWithoutOldHabit = habits.filter((h) => h.id !== habitId);
  setHabits(habitsWithoutOldHabit);
  const r = await fetch("/api/habit/" + habitId, {
    method: "DELETE",
  });
  if (!r.ok) {
    setHabits(oldHabits);
    return;
  }
};

const onEditSubmit = async (
  e: FormEvent<HTMLFormElement>,
  habitId: string,
  habits: Habit[],
  setHabits: (habits: Habit[]) => void
) => {
  const oldHabits = habits;
  const name = (e.target as any).name.value;
  const habit = habits.find((h) => h.id === habitId);
  if (name === undefined || habit === undefined) return;
  const habitsWithoutOldHabit = habits.filter((h) => h.id !== habitId);
  habit.name = name;
  habitsWithoutOldHabit.push(habit);
  setHabits(habits);
  const r = await fetch("/api/habit/" + habitId, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) {
    setHabits(oldHabits);
    return;
  }
};

export default TrackerHabits;
