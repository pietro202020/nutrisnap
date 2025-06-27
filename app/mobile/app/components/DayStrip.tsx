import { View, Pressable, Text, StyleSheet } from 'react-native';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

type Props = { selected: Date; onSelect: (d: Date) => void };

export default function DayStrip({ selected, onSelect }: Props) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return (
    <View style={styles.row}>
      {Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(monday, i);
        const active = isSameDay(d, selected);
        return (
          <Pressable
            key={i}
            style={[styles.day, active && styles.active]}
            onPress={() => onSelect(d)}
          >
            <Text style={styles.label}>{format(d, 'EE', { locale: pl })}</Text>
            <Text style={styles.num}>{format(d, 'd')}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
  day: { alignItems: 'center', padding: 6, borderRadius: 20 },
  active: { backgroundColor: '#1DB954' },
  label: { fontSize: 12, color: '#fff' },
  num: { fontSize: 16, color: '#fff' },
});