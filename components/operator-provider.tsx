"use client";

import { createContext, useContext } from "react";

interface OperatorState {
  isOperator: boolean;
}

const OperatorContext = createContext<OperatorState>({ isOperator: false });

export function useOperator(): OperatorState {
  return useContext(OperatorContext);
}

export function OperatorProvider({
  isOperator,
  children,
}: {
  isOperator: boolean;
  children: React.ReactNode;
}) {
  return <OperatorContext value={{ isOperator }}>{children}</OperatorContext>;
}
