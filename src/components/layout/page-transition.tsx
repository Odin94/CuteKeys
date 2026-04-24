import { AnimatePresence } from "motion/react";
import { useLocation } from "@tanstack/react-router";

type PageTransitionProps = {
  children: React.ReactNode;
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>{children}</div>
    </AnimatePresence>
  );
};
