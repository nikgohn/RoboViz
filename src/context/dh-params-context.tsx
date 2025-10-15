
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { DHParams } from '@/types';

const initialParams: Omit<DHParams, "id">[] = [
  {
    a: 0,
    alpha: 90,
    d: 1,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
  {
    a: 1.5,
    alpha: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
  {
    a: 1,
    alpha: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
];

const LOCAL_STORAGE_KEY = 'robot-dh-params';

type DHParamsContextType = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
  isLoaded: boolean;
};

const DHParamsContext = createContext<DHParamsContextType | undefined>(undefined);

export const DHParamsProvider = ({ children }: { children: ReactNode }) => {
  const [params, setParams] = useState<Omit<DHParams, "id">[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedParams) {
        setParams(JSON.parse(storedParams));
      } else {
        setParams(initialParams);
      }
    } catch (error) {
      console.error("Failed to parse params from localStorage", error);
      setParams(initialParams);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(params));
    }
  }, [params, isLoaded]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <DHParamsContext.Provider value={{ params, setParams, isLoaded }}>
      {children}
    </DHParamsContext.Provider>
  );
};

export const useDHParams = () => {
  const context = useContext(DHParamsContext);
  if (context === undefined) {
    throw new Error('useDHParams must be used within a DHParamsProvider');
  }
  return context;
};
