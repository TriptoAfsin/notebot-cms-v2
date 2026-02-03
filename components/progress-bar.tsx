"use client";

import NextTopLoader from "nextjs-toploader";

export function ProgressBar() {
  return (
    <NextTopLoader
      color="#34d399"
      height={3}
      showSpinner={false}
      shadow="0 0 10px #34d399,0 0 5px #34d399"
    />
  );
}
