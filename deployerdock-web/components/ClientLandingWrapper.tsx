"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@clerk/nextjs";
import React from "react";

export default function ClientLandingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useAuth();
  const { isDarkMode } = useTheme();

  if (!isLoaded) return null;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {children}
    </div>
  );
}
