import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

const API = 'http://192.168.2.195:8000';

type Props = {
  thumb: string | null;              // np. "/thumbs/uuid.jpg"
  name: string;
  kcal: number;
  payload: Record<string, any>;      // pełny obiekt MealDTO (do podglądu)
  onDeleted: () => void;             // refetch w sekcji
};

export default function MealCard({
  thumb,
  name,
  kcal,
  payload,
  onDeleted,
}: Props) {
  const router = useRouter();

  /* ------- kasowanie po kliknięciu ikony ------- */
  const askDelete = () =>
    Alert.alert('Usuń posiłek', 'Czy na pewno chcesz usunąć?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          if (thumb) {
            const file = thumb.split('/').pop();          // <uuid>.jpg
            await axios.delete(`${API}/delete-thumb/${file}`);
            onDeleted();
          }
        },
      },
    ]);

  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({ pathname: '/screens/MealDetailScreen', params: payload })
      }
    >
      {thumb && (
        <Image source={{ uri: API + thumb }} style={styles.img} />
      )}

      {/* nazwa + kcal */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.kcal}>{kcal} kcal</Text>
      </View>

      {/* ikona kosza */}
      <Pressable onPress={askDelete} hitSlop={6}>
        <FontAwesome name="trash-o" size={20} color="#E24C4B" />
      </Pressable>
    </Pressable>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 10,
    marginTop: 6,
    gap: 8,
  },
  img:  { width: 48, height: 48, borderRadius: 8 },
  name: { color: '#fff' },
  kcal: { color: '#1DB954', fontSize: 12 },
});
