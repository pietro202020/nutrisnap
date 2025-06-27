// components/NutrientBar.tsx  (podmień)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NutrientBar({
  label, value, target, unit,
}: {
  label: string; value: number; target: number; unit: string;
}) {
  const pct = Math.min(value / target, 1);
  return (
    <View style={s.wrap}>
      <View style={s.track}>
        <View style={[s.fill, { flex: pct }]} />
        <View style={{ flex: 1 - pct }} />
      </View>
      <Text style={s.caption}>
        {label} {value.toFixed(0)} / {target} {unit}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '48%', marginVertical: 6 },
  track: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: { backgroundColor: '#1DB954' },
  caption: { color: '#aaa', fontSize: 12, marginTop: 2 },
});
