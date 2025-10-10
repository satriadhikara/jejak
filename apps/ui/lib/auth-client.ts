import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: 'jejak',
      storagePrefix: 'jejak',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getCookie } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type Cookies = ReturnType<typeof authClient.getCookie>;
