
export type DHParams = {
  id: string;
  a: number;      // link length
  alpha: number;  // link twist (degrees)
  dOffset: number; // link offset
  d: number; // variable link offset
  dIsVariable: boolean; // is d a variable or fixed
  thetaOffset: number; // joint angle offset (degrees)
  theta: number;  // joint angle (degrees)
  thetaIsFixed: boolean; // is theta slider fixed
};

    