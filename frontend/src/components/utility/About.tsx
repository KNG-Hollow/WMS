// SPDX-License-Identifier: GPL-3.0

import { version } from "@/../package.json";
import { PingHealth } from "@/services/utilityApi";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function About() {
  const [connected, setConnected] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      setConnected(await PingHealth());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col w-5/6 items-center p-20 my-20 border-3 border-cyan-600 bg-gray-900 gap-y-20">
        <div className="flex flex-col font-semibold text-center">
          <h1>Warehouse Management System</h1>
          <h3>{`Version: ${version}`}</h3>
        </div>
        <div className="flex gap-x-2 text-center font-semibold">
          <h3>Connection:</h3>
          {connected ? (
            <h3 className="text-green-600">Active</h3>
          ) : (
            <h3 className="text-red-600">Inactive</h3>
          )}
        </div>
        <div className="mt-auto cursor-pointer">
          <FontAwesomeIcon
            size="2xl"
            icon={faGithub}
            onClick={() =>
              window.open(
                "https://github.com/KNG-Hollow/WMS",
                "_blank",
                "rel=noopener noreferrer",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
