import type { FC, ReactNode } from 'react';

import { useState, useEffect } from 'react';

import { AuthContext } from './useAuth';
import { appConfig } from '../config/config.ts';

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [bruker, setBruker] = useState({ navn: '' });

    const loggInn = (): void => {
        window.location.href = appConfig.loginUrl;
    };

    const loggUt = (): void => {
        // TODO: Legg til backend-endepunkt for å logge ut
    };

    useEffect(() => {
        const sjekkAuth = async (): Promise<void> => {
            try {
                const response = await fetch('/api/me', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBruker({ navn: data.name });
                } else {
                    loggInn();
                }
            } catch (error) {
                console.error('Feil med auth-validering:', error);
            }
        };

        sjekkAuth();
    }, []);

    return <AuthContext value={{ bruker, loggInn, loggUt }}>{children}</AuthContext>;
};
