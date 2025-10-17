
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { DHParams } from '@/types';

const initialParams: Omit<DHParams, "id">[] = [
  {
    a: 0,
    alpha: 90,
    dOffset: 1,
    d: 0,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
  {
    a: 1.5,
    alpha: 0,
    dOffset: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
  {
    a: 1,
    alpha: 0,
    dOffset: 0,
    d: 0,
    thetaOffset: 0,
    theta: 0,
    dIsVariable: false,
    thetaIsFixed: false,
  },
];

export type BaseOrientation = {
  x: number;
  y: number;
  z: number;
};

const initialOrientation: BaseOrientation = { x: 0, y: 0, z: 0 };

const LOCAL_STORAGE_KEY = 'robot-dh-params';
const ORIENTATION_STATE_KEY = 'robot-base-orientation';


type DHParamsContextType = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
  baseOrientation: BaseOrientation;
  setBaseOrientation: Dispatch<SetStateAction<BaseOrientation>>;
  isLoaded: boolean;
};

const DHParamsContext = createContext<DHParamsContextType | undefined>(undefined);

export const DHParamsProvider = ({ children }: { children: ReactNode }) => {
  const [params, setParams] = useState<Omit<DHParams, "id">[]>([]);
  const [baseOrientation, setBaseOrientation] = useState<BaseOrientation>(initialOrientation);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedParams) {
        setParams(JSON.parse(storedParams));
      } else {
        setParams(initialParams);
      }

      const storedOrientation = localStorage.getItem(ORIENTATION_STATE_KEY);
      if (storedOrientation) {
        setBaseOrientation(JSON.parse(storedOrientation));
      }

    } catch (error) {
      console.error("Failed to parse params from localStorage", error);
      setParams(initialParams);
      setBaseOrientation(initialOrientation);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(params));
      localStorage.setItem(ORIENTATION_STATE_KEY, JSON.stringify(baseOrientation));
    }
  }, [params, baseOrientation, isLoaded]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <DHParamsContext.Provider value={{ params, setParams, baseOrientation, setBaseOrientation, isLoaded }}>
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

    