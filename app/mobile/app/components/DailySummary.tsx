import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { RWS } from '../constants/rws';
import { sumDay } from '../utils/sumDay';
import { MealDTO } from '../hooks/UseMeals';
import MiniBar from '../components/MiniBar';

export default function DailySummary({ meals }) {
  const tot = sumDay(meals);
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/screens/SummaryDetailScreen')} style={styles.row}>
      <MiniBar label="kcal"   value={tot.calories_kcal ?? 0}        target={RWS.calories_kcal}         unit="kcal" />
      <MiniBar label="Białko" value={tot.protein_g ?? 0}            target={RWS.protein_g}             unit="g" />
      <MiniBar label="Tłuszcz" value={tot.fat_total_g ?? 0}         target={RWS.fat_total_g}           unit="g" />
      <MiniBar label="Węglow." value={tot.carbohydrates_total_g ?? 0} target={RWS.carbohydrates_total_g} unit="g" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',          // ► obok siebie
    justifyContent: 'space-between',
    //justifyContent: 'space-evenly',  // ← space-evenly gives equal gaps all around
    //alignItems: 'flex-end',  
    padding: 6,
    backgroundColor: '#222',
    borderRadius: 16,
    marginTop: 10,
  },
});
