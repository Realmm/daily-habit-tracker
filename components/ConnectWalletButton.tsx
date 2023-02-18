import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SiweMessage } from "siwe";
import { setSignedInAddress } from "../scripts/slices/signedInAddressSlice";
import useSignedInAddress from "../scripts/hooks/useSignedInAddress";
import truncateEthAddress from "truncate-eth-address";
import { setConnectAddress as setConnectAddressDispatch } from "../scripts/slices/connectAddressSlice";
import useConnectAddress from "../scripts/hooks/useConnectAddress";

type ConnectWalletButtonProps = {
  onDisconnect: () => void | undefined;
  onSignIn: () => void | undefined;
};

const ConnectWalletButton = (props: ConnectWalletButtonProps) => {
  const [connectAddress, setConnectAddress] = useState<string | undefined>();
  const connectAddressStore = useConnectAddress();
  const signedInAddress = useSignedInAddress();
  const dispatch = useDispatch();

  const checkSignedIn = async () => {
    const signedInAddress = await isSignedIn();
    dispatch(setSignedInAddress(signedInAddress));
  };

  useEffect(() => {
    checkSignedIn();
  }, []);

  useEffect(() => {
    if (
      connectAddressStore !== undefined &&
      connectAddressStore !== connectAddress
    )
      setConnectAddress(connectAddressStore);
    if (signedInAddress !== undefined && connectAddress === undefined)
      dispatch(setConnectAddressDispatch(signedInAddress));
  }, [connectAddress, signedInAddress]);

  return (
    <>
      <div className="absolute right-0 z-10 mt-4 mr-10 text-white">
        <button
          className={connectAddress ? "hidden" : ""}
          onClick={async () => {
            const addr = await connect();
            setConnectAddress(addr);
          }}
        >
          Connect Wallet
        </button>
        <div className={connectAddress ? "" : "hidden"}>
          <SignInButton
            onSignIn={props.onSignIn}
            connectAddress={connectAddress!!}
            clearConnectAddress={() => {
              dispatch(setSignedInAddress(undefined));
              setConnectAddress(undefined);
              props?.onDisconnect();
            }}
          />
        </div>
      </div>
    </>
  );
};

type SignInProps = {
  connectAddress: string;
  clearConnectAddress: () => void;
  onSignIn: () => void | undefined;
};

const SignInButton = (props: SignInProps) => {
  const [state, setState] = useState<{
    domain: any;
    origin: any;
  }>();
  const [provider, setProvider] = useState<any>();
  const [signer, setSigner] = useState();

  const signedInAddress = useSignedInAddress();
  const dispatch = useDispatch();
  const [truncated, setTruncated] = useState<string | undefined>();

  useEffect(() => {
    const domain = window.location.host;
    const origin = window.location.origin;
    setState({
      domain: domain,
      origin: origin,
    });
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    setProvider(provider);
  }, []);

  useEffect(() => {
    if (signedInAddress !== undefined)
      setTruncated(truncateEthAddress(signedInAddress!!));
  }, [signer, truncated, signedInAddress]);

  useEffect(() => {
    const signer = provider?.getSigner();
    if (signer === undefined) return;
    setSigner(signer);
  }, [provider]);

  return (
    <>
      <button
        className={signedInAddress === undefined ? "" : "hidden"}
        disabled={signedInAddress !== undefined}
        onClick={async () => {
          if (
            state?.domain === undefined ||
            state?.origin === undefined ||
            signer === undefined
          )
            return;
          const signedIn = await signInWithEthereum(
            state!!.domain,
            state!!.origin,
            signer!!
          );
          if (signedIn.success) {
            props?.onSignIn();
            dispatch(setSignedInAddress(signedIn.address));
          } else dispatch(setSignedInAddress(undefined));
        }}
      >
        {signedInAddress === undefined ? "Sign In" : truncated}
      </button>
      <div className={signedInAddress === undefined ? "hidden" : ""}>
        <div>{truncated}</div>
        <button
          onClick={async () => {
            const loggedOut = await fetch("/api/auth/logout");
            if (loggedOut) {
              props.clearConnectAddress();
            }
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
};

const isSignedIn = async (): Promise<string | undefined> => {
  const res = await fetch("/api/auth/me", {
    method: "GET",
  });
  const address = (await res.json()).address;
  return address;
};

const createSiweMessage = async (
  domain: any,
  origin: any,
  address: string,
  statement: string
) => {
  const res = await fetch("/api/auth/nonce");
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce: await res.text(),
  });
  return message.prepareMessage();
};

type SignInResult = {
  success: boolean;
  address: string;
};
const signInWithEthereum = async (
  domain: any,
  origin: any,
  signer: any
): Promise<SignInResult> => {
  const message = await createSiweMessage(
    domain,
    origin,
    await signer.getAddress(),
    "Sign in with Ethereum to the app."
  );
  const signature = await signer.signMessage(message);
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, signature }),
  });
  const result = await res.json();
  return {
    success: result.success as boolean,
    address: result.address as string,
  };
};

const connect = async (): Promise<string | undefined> => {
  const provider = new ethers.providers.Web3Provider(
    (window as any).ethereum,
    "any"
  );
  return await provider.send("eth_requestAccounts", []);
};

export default ConnectWalletButton;
