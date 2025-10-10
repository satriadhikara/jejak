import { createContext, useContext, ReactNode } from 'react';

type Session = any; // Use 'any' to accept the Better Auth session type directly

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) => <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }
  return context;
};
