// SPDX-License-Identifier: GPL-3.0

import {
  Outlet,
  Meta,
  Links,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import "./App.css";
import { StrictMode, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import packageJson from "../../package.json";
import Footer from "../components/utility/Footer";
import Navbar from "../components/utility/Navbar";
import backgroundImage from "../assets/background.png";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <link
          rel="icon"
          type="image/svg+xml"
          href="../src/assets/favicon.svg"
        />
        <Links />
        <title>WMS</title>
      </head>
      <body>
        {children}
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <div
          className="bg-linear-to-b from-cyan-600 to-slate-600 bg-center bg-no-repeat min-h-screen"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <Navbar />
          <Outlet />
          <Footer />
        </div>
      </Provider>
    </StrictMode>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export async function loader() {
  return {
    version: packageJson.version,
  };
}

export function HydrateFallback({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex font-bold flex-col gap-y-25 items-center bg-linear-to-t from-cyan-600 to-slate-700 bg-center bg-no-repeat min-h-screen">
      <h1 className="mt-15">Loading Version: {loaderData.version}</h1>
      <Spinner />
    </div>
  );
}

export function Spinner() {
  return (
    <div id="spinner-container" className="flex justify-center self-center">
      <div
        id="spinner"
        className="w-24 h-24 rounded-full border-8 border-t-pink-600 animate-spin"
      ></div>
    </div>
  );
}
