import {
  FormEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Habit } from "../scripts/mongo";
import { BiPlus } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import Popup from "./Popup";

type NewHabitButtonProps = {
  setHabits: (habits: Habit[]) => void;
  habits: Habit[];
};

export const NewHabitButton = (props: NewHabitButtonProps) => {
  const [open, setOpen] = useState(false);
  const newHabitButton = useRef(null);
  const habitButtonText = useRef(null);

  useEffect(() => {}, [open]);

  return (
    <>
      <button
        ref={newHabitButton}
        className="shadow-lg rounded-lg flex justify-center px-4 py-2 bg-gray-300 mx-4 mt-6"
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        <div className="my-auto mr-2">
          <BiPlus />
        </div>
        <span ref={habitButtonText}>New Habit</span>
      </button>
      <Popup
        submitText="Save"
        invalidRefs={[newHabitButton, habitButtonText]}
        close={() => setOpen(false)}
        open={open}
        onSubmit={(e) => onSubmit(e, props.habits, props.setHabits)}
        title="Create a new habit"
        fields={[
          { id: "name", placeholder: "Eg. Exercise", title: "Habit Name" },
        ]}
      />
    </>
  );
};

const onSubmit = async (
  e: FormEvent<HTMLFormElement>,
  habits: Habit[],
  setHabits: (habits: Habit[]) => void
) => {
  const name = (e.target as any).name.value;
  const nextNumber = getNextHabitNumber(habits);
  if (name === undefined) return;
  habits.push({
    position: nextNumber,
    id: "",
    name,
  });
  setHabits(habits);
  const r = await fetch("/api/habit", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const id = (await r.json())?.id;
  if (!r.ok || id === undefined) return;
  const r2 = await fetch("/api/habit", {
    method: "GET",
  });
  const data = await r2.json();
  setHabits(data);
};

const getNextHabitNumber = (habits: Habit[]): number => {
  return habits.length === 0 ? 0 : Math.max(...habits.map(h => h.position)) + 1;
};
