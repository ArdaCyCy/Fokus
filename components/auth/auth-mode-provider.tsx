"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

const ClerkUiContext = createContext(false);

export function AuthModeProvider({
  clerkUi,
  children,
}: {
  clerkUi: boolean;
  children: ReactNode;
}) {
  return (
    <ClerkUiContext.Provider value={clerkUi}>{children}</ClerkUiContext.Provider>
  );
}

/** Navbar vb. istemci bileşenlerinde Clerk mi demo mu kullanılacağını sunucudan gelen değer belirler. */
export function useClerkUiEnabled(): boolean {
  return useContext(ClerkUiContext);
}
