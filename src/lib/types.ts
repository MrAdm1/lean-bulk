export interface Macros { kcal: number; p: number; c: number; f: number }

export type FoodUnit = 'pc' | 'g' | 'ml';
export interface Food extends Macros {
  id: string;
  name: string;
  short?: string;
  unit: FoodUnit; // values are per 1 piece (pc) or per 100 g / 100 ml
  per: number;
  label?: boolean; // values copied from a packet the user owns; editable in Settings
}

export interface Entry {
  eid: string;
  kind: 'tpl' | 'food' | 'quick';
  ref?: string;
  name: string;
  note?: string;
  unit: FoodUnit | 'serving';
  per: number;
  qty: number;
  b: Macros; // macros per `per` units at the time it was logged
  meal: string;
}

// Every record carries `u` (last change, ms). Sync merges record by record and the newest wins.
export interface Day { weight?: number; entries: Entry[]; u: number }
export interface Targets { p: number; c: number; f: number }
export interface TargetChange extends Targets { date: string; note: string }
export interface Settings {
  targets: Targets;
  history: TargetChange[];
  foods: Record<string, Omit<Food, 'id'>>;
  programStart: string;
  u: number;
}
export interface LiftPoint { d: string; kg: number }
export interface Lift { h: LiftPoint[]; u: number }
export interface Grocery { checked: Record<string, true>; u: number }

export interface Data {
  v: 1;
  settings: Settings;
  days: Record<string, Day>;
  lifts: Record<string, Lift>;
  grocery: Grocery;
}
