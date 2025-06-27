// app/mobile/app/components/MealSection.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MealCard from './MealCard';
import { MealDTO } from '../hooks/UseMeals';
import { format } from 'date-fns';
type Props = {
  mealKey: string;
  label: string;
  date: Date;
  meals: Record<string, Record<string, MealDTO[]>>;
  refetch: () => void;
};

export default function MealSection({
  mealKey,
  label,
  date,
  meals,
  refetch,
}: Props) {
  const router = useRouter();
  const dayKey = format(date, 'yyyy-MM-dd');
  //const dayKey = date.toISOString().slice(0, 10);
  //console.log(dayKey)
  const list = meals[dayKey]?.[mealKey] ?? [];
 // console.log(list);
  //console.log(meals)
  //console.log(meals)
  /** gdy wrócimy ze screena pickera — odśwież listę */
  const onGoToPicker = () =>
    router.push({
      pathname: '/screens/ImagePickerScreen',
      params: { mealType: mealKey, date: format(date, 'yyyy-MM-dd')},
    });
  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.title}>{label}</Text>
        <Pressable onPress={onGoToPicker}>
          <FontAwesome name="camera" size={20} color="#1DB954" />
        </Pressable>
      </View>

      {list.length === 0 ? (
        <Text style={styles.empty}>Brak wpisów</Text>
      ) : (
        list.map((m) => (
          <MealCard
            key={m.created_at + m.name}
            name={m.name}
            kcal={m.calories_kcal}
            thumb={m.thumb_uri}
            payload={{...m}}
            onDeleted={refetch}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginVertical: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, color: '#fff' },
  empty: { color: '#888', fontStyle: 'italic', marginTop: 4 },
});
