// app/mobile/app/hooks/useMeals.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

export type MealDTO = {
  created_at: string;
  meal_type: string;
  name: string;
  calories_kcal: number;
  thumb_uri: string | null;
};

type MealsByKey = Record<string /*yyy-mm-dd*/, Record<string /*meal*/, MealDTO[]>>;

export default function useMeals() {
  const [meals, setMeals] = useState<MealsByKey>({});
  const [loading, setLoading] = useState(false);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const r = await axios.get('http://192.168.2.195:8000/meals');
      const grouped: MealsByKey = {};
      r.data.forEach((m) => {
        const day = m.created_at.slice(0, 10); // YYYY-MM-DD
        grouped[day] ??= {};
        grouped[day][m.meal_type] ??= [];
        grouped[day][m.meal_type].push(m);
      });
      setMeals(grouped);
    } catch (e: any) {
      console.error("Failed to fetch meals:",e);
    } finally {
      setLoading(false);
    }
  };

  /** call once */
  useEffect(() => {
    fetchMeals();
  }, []);

  return { meals, loading, refetch: fetchMeals };
}
