import React, { useEffect, useState } from "react";
import useSignedInAddress from "../scripts/hooks/useSignedInAddress";

type LoadingProps = {
  loading: boolean;
};

const Loading = (props: LoadingProps) => {
  const address = useSignedInAddress();

  const [hasMetamask, setHasMetamask] = useState(false);

  useEffect(() => {
    setHasMetamask((window as any).ethereum !== undefined)
  }, [])

  useEffect(() => {

  }, [address, props.loading])

  return (
    <>
      <div
        className={
          !hasMetamask ? "w-full h-max text-center text-white absolute pt-40" : "hidden"
        }
      >
        <span className="">
          Please install{" "}
          <a
            className="underline text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
            href="https://metamask.io/"
          >
            Metamask
          </a>
        </span>

        <br />
        <span className="">
          Using Metamask, you can{" "}
          <a
            className="underline text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
            href="https://myterablock.medium.com/how-to-create-or-import-a-metamask-wallet-a551fc2f5a6b"
          >
            generate
          </a>{" "}
          an ethereum wallet for free, and use it to sign in
        </span>
      </div>
      <div className={address === undefined ? "w-full h-max text-white text-center absolute pt-40" : "hidden"}>
        <span>Please sign in to view your habits</span>
      </div>
      <div
        className={
          (props.loading ? "" : "hidden ") +
          (hasMetamask ? "" : " hidden ") +
          (address !== undefined ? "" : " hidden ") +
          "bg-black bg-opacity-20 w-full h-full absolute top-0"
        }
      >
        <div className="mt-60">
          <div className="flex justify-center py-4 text-white">
            <span>Loading habits...</span>
          </div>
          <div className="rounded-full h-20 w-20 border-8 border-t-blue-500 animate-spin flex justify-center m-auto"></div>
        </div>
      </div>
    </>
  );
};

export default Loading;
