// SPDX-License-Identifier: GPL-3.0

import { useAppSelector } from "@/app/hooks";
import { selectAppActive } from "@/features/appSlice";

export default function Footer() {
  const appActive = useAppSelector(selectAppActive);
  const footer = () => {
    const copyright = String.fromCodePoint(0x00a9);
    const year = new Date().getFullYear();
    const companyName = "Jaylen Holloway";

    return (
      <span>{`${copyright} ${year} ${companyName}. All Rights Reserved.`}</span>
    );
  };

  if (!appActive) {
    return null;
  }

  return (
    <div
      id="footer"
      className="fixed bottom-0 left-0 w-svw scale-z-100 text-center bg-cyan-600"
    >
      <div id="footer-text">{footer()}</div>
    </div>
  );
}
