import { createContext, useContext, ReactNode } from 'react';
import { type Session, type Cookies } from './auth-client';

const AuthContext = createContext<{
  session: Session;
  cookies: Cookies;
  role: string | null;
} | null>(null);

export const AuthProvider = ({
  children,
  session,
  cookies,
  role = null,
}: {
  children: ReactNode;
  session: Session;
  cookies: Cookies;
  role?: string | null;
}) => <AuthContext.Provider value={{ session, cookies, role }}>{children}</AuthContext.Provider>;

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
