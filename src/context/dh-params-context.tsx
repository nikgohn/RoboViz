
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
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

export type WorkspaceLimits = Record<number, {min: number, max: number}>;

const initialOrientation: BaseOrientation = { x: 0, y: 0, z: 0 };
const initialWorkspaceLimits: WorkspaceLimits = {};

const PARAMS_STORAGE_KEY = 'robot-dh-params';
const ORIENTATION_STORAGE_KEY = 'robot-base-orientation';
const WORKSPACE_LIMITS_STORAGE_KEY = 'robot-workspace-limits';


type DHParamsContextType = {
  params: Omit<DHParams, "id">[];
  setParams: Dispatch<SetStateAction<Omit<DHParams, "id">[]>>;
  baseOrientation: BaseOrientation;
  setBaseOrientation: Dispatch<SetStateAction<BaseOrientation>>;
  workspaceLimits: WorkspaceLimits;
  setWorkspaceLimits: Dispatch<SetStateAction<WorkspaceLimits>>;
  getQIndexForParam: (paramIndex: number, type: 'd' | 'theta') => number | null;
  isLoaded: boolean;
};

const DHParamsContext = createContext<DHParamsContextType | undefined>(undefined);

export const DHParamsProvider = ({ children }: { children: ReactNode }) => {
  const [params, setParams] = useState<Omit<DHParams, "id">[]>([]);
  const [baseOrientation, setBaseOrientation] = useState<BaseOrientation>(initialOrientation);
  const [workspaceLimits, setWorkspaceLimits] = useState<WorkspaceLimits>(initialWorkspaceLimits);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedParams = localStorage.getItem(PARAMS_STORAGE_KEY);
      if (storedParams) {
        setParams(JSON.parse(storedParams));
      } else {
        setParams(initialParams);
      }

      const storedOrientation = localStorage.getItem(ORIENTATION_STORAGE_KEY);
      if (storedOrientation) {
        setBaseOrientation(JSON.parse(storedOrientation));
      }
      
      const storedLimits = localStorage.getItem(WORKSPACE_LIMITS_STORAGE_KEY);
      if (storedLimits) {
          setWorkspaceLimits(JSON.parse(storedLimits));
      }

    } catch (error) {
      console.error("Failed to parse params from localStorage", error);
      setParams(initialParams);
      setBaseOrientation(initialOrientation);
      setWorkspaceLimits(initialWorkspaceLimits);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(params));
      localStorage.setItem(ORIENTATION_STORAGE_KEY, JSON.stringify(baseOrientation));
      localStorage.setItem(WORKSPACE_LIMITS_STORAGE_KEY, JSON.stringify(workspaceLimits));
    }
  }, [params, baseOrientation, workspaceLimits, isLoaded]);

  const getQIndexForParam = useCallback((paramIndex: number, type: 'd' | 'theta'): number | null => {
    let qIndexCounter = 1;
    for (let i = 0; i < params.length; i++) {
        const p = params[i];
        if (!p.thetaIsFixed) {
            if (i === paramIndex && type === 'theta') {
                return qIndexCounter;
            }
            qIndexCounter++;
        }
        if (p.dIsVariable) {
             if (i === paramIndex && type === 'd') {
                return qIndexCounter;
            }
            qIndexCounter++;
        }
    }
    return null;
  }, [params]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <DHParamsContext.Provider value={{ params, setParams, baseOrientation, setBaseOrientation, workspaceLimits, setWorkspaceLimits, getQIndexForParam, isLoaded }}>
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
