// app/mobile/app/screens/SummaryDetailScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addDays, startOfWeek } from 'date-fns';
import { useMealsCtx } from '../provider/MealsContext';
import { RWS } from '../constants/rws';
import { sumDay } from '../utils/sumDay';
import { localKey } from '../utils/date';

type Tab = 'day' | 'week';

// mapowanie kluczy na polskie etykiety
const nutrientLabels: Record<string, string> = {
  calories_kcal:    'Kalorie',
  protein_g:        'Białko',
  fat_total_g:      'Tłuszcz',
  fat_saturated_g:  'Tłuszcze nasycone',
  carbohydrates_total_g: 'Węglowodany',
  sugar_g:          'Cukier',
  fiber_g:          'Błonnik',
  sodium_mg:        'Sód',
  potassium_mg:     'Potas',
  cholesterol_mg:   'Cholesterol',
};

export default function SummaryDetailScreen() {
  const router = useRouter();
  const { meals } = useMealsCtx();
  const [tab, setTab] = useState<Tab>('day');

  // dane dzienne
  const todayKey = localKey(new Date().toISOString());
  const today = sumDay(Object.values(meals[todayKey] ?? {}).flat());

  // dane tygodniowe
  const mon = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekMeals = Array.from({ length: 7 }).flatMap((_, i) =>
    Object.values(meals[localKey(addDays(mon, i).toISOString())] ?? {}).flat()
  );
  const week = sumDay(weekMeals);

  const active = tab === 'day' ? today : week;
  const targetMul = tab === 'day' ? 1 : 7;

  // lista kluczy bez rozmiaru porcji
  const keys = Object.keys(active).filter(k => k !== 'serving_size_g');

  return (
    <SafeAreaView style={s.safe}>
      {/* HEADER */}
      <Pressable style={s.back} onPress={() => router.back()}>
        <Text style={s.backTxt}>‹ Powrót</Text>
      </Pressable>

      {/* TABS */}
      <View style={s.tabs}>
        <TabBtn active={tab === 'day'} label="Dzień"   onPress={() => setTab('day')} />
        <TabBtn active={tab === 'week'} label="Tydzień" onPress={() => setTab('week')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {keys.map((k) => (
          <Row
            key={k}
            // teraz z mapowania na Polish label
            label={nutrientLabels[k] ?? k}
            value={active[k]}
            target={(RWS as any)[k] ? (RWS as any)[k] * targetMul : null}
            unit={k.includes('_kcal') ? 'kcal' : k.includes('_mg') ? 'mg' : 'g'}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number | null;
  unit: string;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowVal}>
        {value.toFixed(0)} {unit}
        {target !== null && (
          <Text style={s.rowTarget}> / {target} {unit}</Text>
        )}
      </Text>
    </View>
  );
}

function TabBtn({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[s.tabBtn, active && s.tabActive]} onPress={onPress}>
      <Text style={active ? s.tabTxtActive : s.tabTxt}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#111' },
  back:      { padding: 12 },
  backTxt:   { color: '#1DB954', fontSize: 16 },
  tabs:      {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 12,
  },
  tabBtn:    { paddingVertical: 6, paddingHorizontal: 20 },
  tabActive: { backgroundColor: '#1DB954', borderRadius: 12 },
  tabTxt:    { color: '#fff', fontSize: 14 },
  tabTxtActive: { color: '#000', fontSize: 14, fontWeight: '600' },

  row:       {
    flexDirection: 'row',
    justifyContent:  'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rowLabel:  { color: '#aaa', textTransform: 'none' },
  rowVal:    { color: '#fff' },
  rowTarget: { color: '#aaa', fontSize: 12 },
});
