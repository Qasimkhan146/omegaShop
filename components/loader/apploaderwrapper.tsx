"use client";

import React, { useState, useEffect } from "react";
import Loader from "./loader";

const AppLoaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  return <>{children}</>;
};

export default AppLoaderWrapper;
