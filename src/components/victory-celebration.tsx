import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

const CONFETTI = [
  { x: -96, y: -216, delay: 0, scale: 0.8, color: '#00E5B4' },
  { x: -72, y: -184, delay: 45, scale: 0.6, color: '#D6A943' },
  { x: -48, y: -238, delay: 90, scale: 1, color: '#F7CE63' },
  { x: -24, y: -196, delay: 135, scale: 0.7, color: '#C44732' },
  { x: 0, y: -248, delay: 180, scale: 0.9, color: '#00E5B4' },
  { x: 24, y: -208, delay: 225, scale: 0.65, color: '#D6A943' },
  { x: 48, y: -232, delay: 30, scale: 0.85, color: '#F7CE63' },
  { x: 72, y: -190, delay: 75, scale: 0.75, color: '#C44732' },
  { x: 96, y: -220, delay: 120, scale: 1, color: '#00E5B4' },
  { x: -82, y: -252, delay: 165, scale: 0.55, color: '#D6A943' },
  { x: 58, y: -258, delay: 210, scale: 0.7, color: '#F7CE63' },
  { x: 86, y: -172, delay: 255, scale: 0.9, color: '#C44732' },
] as const;

function ConfettiParticle({ x, y, delay, scale, color }: (typeof CONFETTI)[number]) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) }),
      ),
    );
    translateY.value = withDelay(
      delay,
      withTiming(y, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, opacity, translateY, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x },
      { translateY: translateY.value },
      { scale },
    ],
  }));

  return <Animated.View style={[styles.particle, animatedStyle, { backgroundColor: color }]} />;
}

export function VictoryCelebration() {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 90 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 90 })
    );
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {CONFETTI.map((particle) => <ConfettiParticle key={`${particle.x}-${particle.y}`} {...particle} />)}
      <Text style={styles.title}>¡JAQUE MATE!</Text>
      <Text style={styles.subtitle}>¡Has ganado la partida!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 440, alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, backgroundColor: '#3B2D10', borderWidth: 2, borderColor: '#D6A943', marginVertical: 10, shadowColor: '#D6A943', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8, overflow: 'visible' },
  title: { color: '#F7CE63', fontSize: 32, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { color: '#F6E6BD', fontSize: 16, fontWeight: '700', marginTop: 4 },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, zIndex: -1 },
});
