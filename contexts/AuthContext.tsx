import { createContext, ReactNode, useState } from 'react';
import { api } from '../services/api';
import Router from 'next/router';

type SignInCredentials = {
  email: string,
  password: string
};

type User = {
  email: string,
  permissions: string[],
  roles: string[]
};

type AuthProviderProps = {
  children: ReactNode
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>,
  user: User,
  isAuthenticated: boolean
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {

    try {

      const response = await api.post('sessions', {
        email,
        password
      });

      const { permissions, roles } = response.data;

      setUser({
        email,
        permissions,
        roles
      });

      Router.push('/dashboard');

    } catch (error) {
      alert(error);
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }} >
      {children}
    </AuthContext.Provider>
  )

}