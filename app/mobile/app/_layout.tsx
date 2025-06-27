// app/mobile/app/_layout.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MealsProvider } from './provider/MealsContext';

export default function Layout() {
  return (
    <GestureHandlerRootView style={s.root}>
      <MealsProvider>
        <Slot />
      </MealsProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
