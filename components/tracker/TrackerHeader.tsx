import { useEffect, useState } from "react";
import { getDate } from "../../scripts/util";
import { DateType } from "./Tracker";
import { AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";

type TrackerHeaderProps = {
  date: DateType | undefined;
  setMonth: (month: number) => void;
  month: number | undefined;
};

const TrackerHeader = (props: TrackerHeaderProps) => {
  return (
    <>
      <MonthTracker
        month={props.month}
        setMonth={props.setMonth}
        date={props.date}
      />
      <div className="flex w-full">
        <HabitTitle />
        <CalendarDays month={props.month} />
      </div>
    </>
  );
};

type MonthTrackerProps = {
  date: DateType | undefined;
  setMonth: (month: number) => void;
  month: number | undefined;
};

const getMonthName = (month: number | undefined) => {
  if (month === undefined) return "";
  let name = "";
  switch (month) {
    case 1:
      name = "January";
      break;
    case 2:
      name = "February";
      break;
    case 3:
      name = "March";
      break;
    case 4:
      name = "April";
      break;
    case 5:
      name = "May";
      break;
    case 6:
      name = "June";
      break;
    case 7:
      name = "July";
      break;
    case 8:
      name = "August";
      break;
    case 9:
      name = "September";
      break;
    case 10:
      name = "October";
      break;
    case 11:
      name = "November";
      break;
    case 12:
      name = "December";
      break;
  }
  return name;
};

const MonthTracker = (props: MonthTrackerProps) => {
  return (
    <>
      <div className="w-full py-7 text-center flex justify-center">
        <button
          onClick={() => {
            if (props.month === undefined) return;
            if (props.month === 1) {
              props.setMonth(12);
            } else {
              props.setMonth(props.month - 1);
            }
          }}
          className="my-auto"
        >
          <AiFillCaretLeft size={20} />
        </button>
        <span className="px-4">{getMonthName(props.month)}</span>
        <button
          onClick={() => {
            if (props.month === undefined) return;
            if (props.month === 12) {
              props.setMonth(1);
            } else {
              props.setMonth(props.month + 1);
            }
          }}
          className="my-auto"
        >
          <AiFillCaretRight size={20} />
        </button>
      </div>
    </>
  );
};

const HabitTitle = () => {
  return (
    <>
      <div
        style={{
          width: "20%",
        }}
        className="border-gray-300 border-b-2 border-r-2 float-left text-center text-4xl font-semibold flex justify-center h-20"
      >
        <span className="m-auto">Habits</span>
      </div>
    </>
  );
};

type CalendarDayProps = {
  day: number;
  dayName: string;
  current: boolean;
  month: number | undefined;
};

const CalendarDay = (props: CalendarDayProps) => {
  return (
    <>
      <div
        className={
          (props.current ? "bg-gray-800 text-white" : "bg-gray-100") +
          " border-r-2 border-b-2 border-t-2 border-gray-300 text-center w-full text-sm inline-block"
        }
      >
        <div className="h-full my-auto">
          <div className="border-b-2 py-1">{props.dayName}</div>
          <div className="flex pb-8 h-full">
            <span className="m-auto">{props.day}</span>
          </div>
        </div>
      </div>
    </>
  );
};

type CalendarDaysProps = {
  month: number | undefined;
};

export const CalendarDays = (props: CalendarDaysProps) => {
  const [days, setDays] = useState<JSX.Element[]>();

  useEffect(() => {
    if (!props.month) return;
    const allDays: any = [];
    const date = getDate();
    const daysInMonth = getDaysInMonth(props.month);
    for (let i = 1; i <= daysInMonth; i++) {
      allDays.push({
        day: i,
        dayName: getDayLetter(
          new Date(date.getFullYear(), props.month, i - 1).getDay() + 1
        ),
        key: i,
        current: date.getDate() === i && date.getMonth() === props.month,
      });
    }
    const dayElements: JSX.Element[] = [];
    allDays.forEach((e: any) => {
      dayElements.push(
        <CalendarDay
          month={props.month}
          day={e.day}
          dayName={e.dayName}
          key={e.key}
          current={e.current}
        />
      );
    });
    setDays(dayElements);
  }, [props.month]);

  useEffect(() => {}, [days]);

  return (
    <>
      <div
        className="flex h-20"
        style={{
          minWidth: "60rem",
          width: "80%",
        }}
      >
        {days}
      </div>
    </>
  );
};

export const getDaysInMonth = (month: number) => {
  var now = getDate();
  return new Date(now.getFullYear(), month, 0).getDate();
};

const getDayLetter = (dayOfWeek: Number) => {
  let letter = "Unknown";
  switch (dayOfWeek) {
    case 1:
      letter = "M";
      break;
    case 2:
      letter = "T";
      break;
    case 3:
      letter = "W";
      break;
    case 4:
      letter = "T";
      break;
    case 5:
      letter = "F";
      break;
    case 6:
      letter = "S";
      break;
    case 7:
      letter = "S";
      break;
  }
  return letter;
};

export default TrackerHeader;
