"use client";

import { scan } from "react-scan";
import { useEffect } from "react";

export function ScanProvider() {
  useEffect(() => {
    scan({
      enabled: process.env.NODE_ENV === "development",
    });
  }, []);

  return null;
}
