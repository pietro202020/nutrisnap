import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MiniBar({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = Math.min(value / target, 1);

  return (
    <View style={s.wrap}>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={s.txt}>
        {label} {value.toFixed(0)}
      </Text>
      <Text style={s.unit}>/{target} {unit}</Text>
    </View>
  );
}

const BAR_W = 80;   // szerokość jednej belki
const BAR_H = 6;

const s = StyleSheet.create({
  wrap: {
    width: BAR_W,
    alignItems: 'flex-start', 
    margin: 'auto',   // ← lewe wyrównanie
  },
  track: {
    width: BAR_W,
    height: BAR_H,
    backgroundColor: '#333',
    borderRadius: BAR_H / 2,
    overflow: 'hidden',
  },
  fill: {
    height: BAR_H,
    backgroundColor: '#1DB954',
  },
  txt: {
    color: '#fff',
    fontSize: 13,                // ← większy font
    marginTop: 4,
    textAlign: 'left',           // ← lewe wyrównanie
  },
  unit: {
    color: '#aaa',
    fontSize: 13,     
    textAlign: 'left',           // nieco większe
  },
});
