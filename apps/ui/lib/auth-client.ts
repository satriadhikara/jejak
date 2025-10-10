import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: "jejak",
      storagePrefix: "jejak",
      storage: SecureStore,
    }),
  ],
});
