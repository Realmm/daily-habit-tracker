import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useState } from "react";
import store from "../scripts/store";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={store}>
        <Component className="font-roboto" {...pageProps} />
      </Provider>
    </>
  );
}

export default MyApp;
