// app/index.tsx  – intro z trzema słupkami
import 'expo-router/entry';
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();   // nie chowaj od razu

export default function Intro() {
  /* trzy niezależne słupki */
  const bar1 = useRef(new Animated.Value(0.2)).current;
  const bar2 = useRef(new Animated.Value(0.4)).current;
  const bar3 = useRef(new Animated.Value(0.3)).current;

  /* helper do animacji góra↔︎dół */
  const pulse = (val: Animated.Value, startDelay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(startDelay),              // ⬅️  opóźnienie na starcie
        Animated.timing(val, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: 0.2,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      /* brak pola delay tutaj */
    );
  

  /* uruchom animację i zaplanuj przejście do Home */
  useEffect(() => {
    SplashScreen.hideAsync();          // chowamy splash gdy tylko JS wystartuje
    pulse(bar1,   0).start();
    pulse(bar2, 150).start();
    pulse(bar3, 300).start();

    const t = setTimeout(() => {
      router.replace('/screens/HomeScreen');
    }, 2800);                          // 2,8 s animacji

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      <View style={s.frame}>
        <Animated.View style={[s.bar, { transform: [{ scaleY: bar1 }] }]} />
        <Animated.View style={[s.bar, { transform: [{ scaleY: bar2 }] }]} />
        <Animated.View style={[s.bar, { transform: [{ scaleY: bar3 }] }]} />      
      </View>
      <View>
        <Text style={s.title}>NutriSnap</Text>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const BAR_W   = 18;   // szerokość pojedynczej belki
const BAR_GAP = 14;   // odstęp
const BAR_H   = 120;  // maks. wysokość

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },

  frame: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_H,
  },

  bar: {
    width: BAR_W,
    height: BAR_H,
    marginHorizontal: BAR_GAP / 2,
    backgroundColor: '#1DB954',
    borderRadius: 6,
    transformOrigin: 'bottom',       // Android web-style; iOS domyślnie bottom
  },

  title:   { color: '#1DB954', fontSize: 28, fontWeight: '700', marginTop: 32, letterSpacing: 1 },

});
