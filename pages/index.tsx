import { NextPage } from "next";
import ConnectWalletButton from "../components/ConnectWalletButton";
import Tracker from "../components/tracker/Tracker";
import { useEffect, useState } from "react";
import { Habit } from "../scripts/mongo";
import useSignedInAddress from "../scripts/hooks/useSignedInAddress";
import Loading from "../components/Loading";

const Home: NextPage = () => {
  const address = useSignedInAddress();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[] | undefined>();

  const updateHabits = async () => {
    const addressRes = await fetch('/api/auth/me', {
      method: 'GET'
    }) 
    const addressFound = (await addressRes.json()).address
    if (address === undefined || addressFound === undefined) {
      setHabits([]);
      setLoading(true);
      return;
    }
    const foundHabits = await fetch("/api/habit", {
      method: "GET",
    });
    if (foundHabits.status !== 200) return;
    const data: [] = await foundHabits.json();
    const habitArray: Habit[] = [];
    data.forEach((h: any) => {
      habitArray.push({
        position: h.position,
        id: h.id,
        name: h.name,
        days: h?.days,
      });
    });
    setLoading(false);
    setHabits(sortHabits(habitArray));
  };

  const sortHabits = (habitArray: Habit[]): Habit[] => {
    return habitArray.sort((h1: any, h2: any) =>
      h1.position > h2.position ? 1 : -1
    );
  };

  useEffect(() => {
    updateHabits();
  }, []);

  useEffect(() => {
    updateHabits();
  }, [address]);

  useEffect(() => {}, [habits, loading]);

  return (
    <>
      <div className="w-full h-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-900">
        <div className="bg-black min-h-screen bg-opacity-30">
        <ConnectWalletButton
          onDisconnect={() => {
            updateHabits();
          }}
          onSignIn={() => {
            updateHabits();
          }}
        />
        <div className="py-4 px-6 text-3xl text-white">
          <span>Daily Habit Tracker</span>
        </div>
        <Tracker
          loading={loading}
          habits={habits === undefined ? [] : habits}
          setHabits={(newHabits) => {
            const array = [...newHabits];
            const sorted = sortHabits(array);
            setHabits(sorted);
          }}
        />
        <Loading loading={loading} />
        </div>
        
      </div>
    </>
  );
};

export default Home;