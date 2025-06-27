// providers/MealsContext.tsx
import React, { createContext, useContext, useState } from 'react';
import useMealsHook, { MealDTO } from '../hooks/UseMeals';

type Ctx = {
  meals: ReturnType<typeof useMealsHook>['meals'];
  insert: (m: MealDTO) => void;
  refetch: () => void;
};
const MealsCtx = createContext<Ctx | null>(null);

export const MealsProvider = ({ children }: { children: React.ReactNode }) => {
  const { meals, refetch } = useMealsHook();
  const [local, setLocal] = useState<MealDTO[]>([]);

  const insert = (m: MealDTO) => setLocal((cur) => [...cur, m]);

  // merge z backendem
  const merged = { ...meals };
  local.forEach((m) => {
    const day = m.created_at.slice(0, 10);
    merged[day] ??= {};
    merged[day][m.meal_type] ??= [];
    merged[day][m.meal_type].push(m);
  });

  return (
    <MealsCtx.Provider value={{ meals: merged, insert, refetch }}>
      {children}
    </MealsCtx.Provider>
  );
};

export const useMealsCtx = () => useContext(MealsCtx)!;
