// app/mobile/app/screens/HomeScreen.tsx
import React, { useState , useEffect} from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import DayStrip from '../components/DayStrip';
import MealSection from '../components/MealSection';
import useMeals from '../hooks/UseMeals';
import { useLocalSearchParams } from 'expo-router';
import DailySummary from '../components/DailySummary';

const MEALS = [
  { key: 'breakfast', label: 'Śniadanie' },
  { key: 'second_breakfast', label: 'II Śniadanie' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Obiad' },
  { key: 'snack', label: 'Przekąska' },
  { key: 'supper', label: 'Kolacja' },
];

export default function HomeScreen() {
  const [selected, setSelected] = useState(new Date());
  const { meals, refetch } = useMeals();      // ← Tylko tu!

  const selectedDateKey = `${selected.getFullYear()}-${(selected.getMonth() + 1).toString().padStart(2, '0')}-${selected.getDate().toString().padStart(2, '0')}`;


  const { refresh } = useLocalSearchParams();
  useEffect(() => {
    refetch();
  }, [refresh]);  
  //console.log(meals)
  const formattedDate = `${selected.getFullYear()}-${(selected.getMonth() + 1).toString().padStart(2, '0')}-${selected.getDate().toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <DayStrip selected={selected} onSelect={setSelected} />
      <ScrollView contentContainerStyle={styles.scroller}>
        {MEALS.map((m) => (
          <MealSection
            key={m.key}
            mealKey={m.key}
            label={m.label}
            date={selected}
            meals={meals}       /* ▼ przekazujesz gotowe dane */
            refetch={refetch}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <DailySummary meals={Object.values(meals[selectedDateKey] ?? {}).flat()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  scroll: { flex: 1 },
  scroller: { padding: 12, paddingBottom: 0 /* usuń paddingBottom, bo masz footer */ },
  footer: {
    backgroundColor: '#222',
    paddingTop: 10,
    paddingBottom: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
