"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "icon" | "nav";
  className?: string;
};

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const nextLabel = isDark ? "Light" : "Dark";

  const toggleTheme = () => {
    setTheme(isDark ? "trickipedia" : "dark");
  };

  // Skeleton states
  if (!mounted) {
    if (variant === "icon") {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <div className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }
    return (
      <div className="h-9 w-full rounded-md bg-muted/20 animate-pulse" />
    );
  }

  if (variant === "nav") {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={toggleTheme}
        className={cn(
          "w-full justify-start gap-2 h-auto py-2 text-base md:text-sm font-normal",
          "hover:text-white",
          className
        )}
      >
        {isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="truncate">Switch to {nextLabel} Mode</span>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // Icon variant
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("h-9 w-9", className)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Switch to {nextLabel} Mode</span>
    </Button>
  );
}
