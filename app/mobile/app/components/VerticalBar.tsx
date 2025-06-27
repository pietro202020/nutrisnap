import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  label: string;
  value: number;
  target: number;
  unit: string;
};

export default function VerticalBar({ label, value, target, unit }: Props) {
  const pct = Math.min(value / target, 1);

  return (
    <View style={s.wrap}>
      <View style={s.track}>
        <View style={[s.fill, { flex: pct }]} />
        <View style={{ flex: 1 - pct }} />
      </View>

      <Text style={s.val}>
        {value.toFixed(0)}
        <Text style={s.unit}> / {target} {unit}</Text>
      </Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const BAR_W = 50;
const BAR_H = 120;

const s = StyleSheet.create({
  wrap: { width: BAR_W, alignItems: 'center' },
  track: {
    width: BAR_W,
    height: BAR_H,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  fill: { backgroundColor: '#1DB954', width: '100%' },
  val: { color: '#fff', fontSize: 14, marginTop: 4 },
  unit: { color: '#aaa', fontSize: 10 },
  label: { color: '#aaa', fontSize: 12 },
});
