import { MealDTO } from '../hooks/UseMeals';

export function sumDay(meals: MealDTO[]): Record<string, number> {
  return meals.reduce((tot, m) => {
    Object.keys(m).forEach((k) => {
      if (typeof (m as any)[k] === 'number') {
        tot[k] = (tot[k] ?? 0) + (m as any)[k];
      }
    });
    return tot;
  }, {} as Record<string, number>);
}
