import React from 'react';
import { SafeAreaView, View, Image, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

type Params = {
  name: string;
  thumb: string | null;
  calories_kcal: string;
  protein_g: string;
  fat_total_g: string;
  carbohydrates_total_g: string;
  sugar_g: string;
  serving_size_g: string;
  fat_saturated_g: string;
  cholesterol_mg: string;
  fiber_g: string;
  sodium_mg: string;
  potassium_mg: string;
};

export default function MealDetailScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<Params>();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#1DB954" />
        </Pressable>
        <Text style={s.headerTitle}>{p.name}</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {p.thumb && (
          <Image
            source={{ uri: 'http://192.168.2.195:8000' + p.thumb }}
            style={s.img}
          />
        )}

        {/* same grid as on picker */}
        <View style={s.card}>
          <MacroItem icon="fire" label="Calories" value={p.calories_kcal} unit="kcal" />
          <MacroItem icon="balance-scale" label="Serving" value={p.serving_size_g} unit="g" />
          <MacroItem icon="cutlery" label="Protein" value={p.protein_g} unit="g" />
          <MacroItem icon="leaf" label="Carbs" value={p.carbohydrates_total_g} unit="g" />
          <MacroItem icon="tint" label="Fats" value={p.fat_total_g} unit="g" />
          <MacroItem icon="heartbeat" label="Sat Fat" value={p.fat_saturated_g} unit="g" />
          <MacroItem icon="cube" label="Sugar" value={p.sugar_g} unit="g" />
          <MacroItem icon="heartbeat" label="Cholest." value={p.cholesterol_mg} unit="mg" />
          <MacroItem icon="bars" label="Fiber" value={p.fiber_g} unit="g" />
          <MacroItem icon="eyedropper" label="Sodium" value={p.sodium_mg} unit="mg" />
          <MacroItem icon="map-pin" label="Potassium" value={p.potassium_mg} unit="mg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroItem({
  icon,
  label,
  value,
  unit,
}: {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <View style={s.macroBox}>
      <FontAwesome name={icon} size={20} color="#000" />
      <Text style={s.macroLabel}>{label}</Text>
      <Text style={s.macroVal}>
        {value} <Text style={s.macroUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', flexShrink: 1 },
  body: { alignItems: 'center', padding: 16 },
  img: { width: 220, height: 220, borderRadius: 12, marginBottom: 16 },
  card: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  macroBox: { width: '48%', backgroundColor: '#222', padding: 12, borderRadius: 12 },
  macroLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  macroVal: { color: '#fff', fontSize: 18, fontWeight: '600' },
  macroUnit: { fontSize: 12, color: '#aaa' },
});
