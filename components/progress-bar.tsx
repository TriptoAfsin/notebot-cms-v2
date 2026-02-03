"use client";

import NextTopLoader from "nextjs-toploader";

export function ProgressBar() {
  return (
    <NextTopLoader
      color="#45a243"
      height={3}
      showSpinner={false}
      shadow="0 0 10px #45a243,0 0 5px #45a243"
    />
  );
}
