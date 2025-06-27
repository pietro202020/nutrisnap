// app/mobile/app/screens/ImagePickerScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

/* ---------- typ odpowiedzi ---------- */
type Nutrition = {
  error?: string;
  name: string;
  calories_kcal: number;
  protein_g: number;
  fat_total_g: number;
  carbohydrates_total_g: number;
  sugar_g: number;
  serving_size_g: number;
  fat_saturated_g: number;
  cholesterol_mg: number;
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
};

export default function ImagePickerScreen() {
  const router = useRouter();
  const { mealType, date } = useLocalSearchParams<{ mealType: string; date: string }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult]   = useState<Nutrition | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* -------- GALERIA -------- */
  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],        // kwadrat
      quality: 0.8,
    });
    if (!res.canceled && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setErrorMsg(null);
    }
  };

  /* -------- KAMERA -------- */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak uprawnień', 'Nadaj dostęp do kamery w ustawieniach');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],        // wymuś kadr 1×1
      quality: 0.8,
    });
    if (!res.canceled && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setErrorMsg(null);
    }
  };

  /* -------- ANALIZA -------- */
  const analyze = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const body = new FormData();
      body.append('file', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
      body.append('meal_type', mealType ?? '');
      body.append('date', date ?? '');
      const r = await axios.post('http://192.168.2.195:8000/analyze', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(r.data);
      if (r.data.error) {
        Alert.alert('Brak jedzenia', 'Nie wykryto jedzenia. Spróbuj ponownie.');
      } else {
        router.setParams({ refresh: Date.now().toString() });
      }
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || 'Coś poszło nie tak.';
      setErrorMsg(msg);
      setImageUri(null);
    } finally {
      setLoading(false);
    }
  };

  /* -------- RENDER -------- */
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#1DB954" />
        </Pressable>
        <Text style={styles.headerTitle}>Dodaj zdjęcie</Text>
      </View>

      {/* TREŚĆ W SCROLLVIEW */}
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {!imageUri && (
          <>
            <Pressable style={styles.pickBtn} onPress={takePhoto}>
              <FontAwesome name="camera" size={22} color="#fff" />
              <Text style={styles.pickText}>Zrób zdjęcie</Text>
            </Pressable>

            <Pressable style={styles.pickBtn} onPress={pickFromGallery}>
              <FontAwesome name="image" size={22} color="#fff" />
              <Text style={styles.pickText}>Z galerii</Text>
            </Pressable>
          </>
        )}

        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} />

            {!result && !loading && (
              <Pressable style={styles.analyzeBtn} onPress={analyze}>
                <Text style={styles.analyzeText}>Analizuj</Text>
              </Pressable>
            )}

            {loading && <ActivityIndicator size="large" color="#1DB954" />}

            {result && !result.error && (
              <View style={styles.card}>
                <Text style={styles.dishName}>{result.name}</Text>
                <MacroItem icon="fire" label="Calories" value={result.calories_kcal} unit="kcal" />
                <MacroItem icon="balance-scale" label="Serving Size" value={result.serving_size_g} unit="g" />
                <MacroItem icon="cutlery" label="Protein" value={result.protein_g} unit="g" />
                <MacroItem icon="leaf" label="Carbs" value={result.carbohydrates_total_g} unit="g" />
                <MacroItem icon="tint" label="Fats" value={result.fat_total_g} unit="g" />
                <MacroItem icon="heartbeat" label="Saturated Fat" value={result.fat_saturated_g} unit="g" />
                <MacroItem icon="cubes" label="Sugar" value={result.sugar_g} unit="g" />  
                <MacroItem icon="heartbeat" label="Cholesterol" value={result.cholesterol_mg} unit="mg" />
                <MacroItem icon="bars" label="Fiber" value={result.fiber_g} unit="g" />
                <MacroItem icon="eyedropper" label="Sodium" value={result.sodium_mg} unit="mg" />
                <MacroItem icon="map-pin" label="Potassium" value={result.potassium_mg} unit="mg" />
              </View>
            )}
          </>
        )}

        {errorMsg && <Text style={styles.err}>{errorMsg}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- MAŁE POLE MAKRO ---------- */
function MacroItem({
  icon,
  label,
  value,
  unit,
}: {
  icon: any;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.macroBox}>
      <FontAwesome name={icon} size={20} color="#000" />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroVal}>
        {value}{' '}
        <Text style={styles.macroUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '600' },

  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  pickBtn: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 6,
  },
  pickText: { color: '#fff', fontSize: 16 },

  preview: { width: 250, height: 250, marginVertical: 16, borderRadius: 12 },

  analyzeBtn: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  analyzeText: { color: '#fff', fontSize: 16 },

  err: { color: 'red', marginTop: 8 },
  dishName: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },

  card: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  macroBox: { width: '48%', backgroundColor: '#222', padding: 12, borderRadius: 12 },
  macroLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  macroVal: { color: '#fff', fontSize: 18, fontWeight: '600' },
  macroUnit: { fontSize: 12, color: '#aaa' },
});
