import { useCallback } from 'react';
import { Vibration, Platform } from 'react-native';

export function useHaptics() {
  const hapticMove = useCallback(() => {
    // A subtle short vibration for a move
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(20);
    }
  }, []);

  const hapticCapture = useCallback(() => {
    // A slightly stronger/longer vibration for capturing a piece
    if (Platform.OS === 'ios') {
      Vibration.vibrate(20);
    } else {
      Vibration.vibrate(40);
    }
  }, []);

  const hapticCheck = useCallback(() => {
    // Two short pulses for a check
    Vibration.vibrate([0, 30, 50, 30]);
  }, []);

  const hapticVictory = useCallback(() => {
    // A celebratory pattern
    Vibration.vibrate([0, 40, 60, 40, 60, 100]);
  }, []);

  const hapticDefeat = useCallback(() => {
    // A longer, somber vibration
    Vibration.vibrate(500);
  }, []);

  return { hapticMove, hapticCapture, hapticCheck, hapticVictory, hapticDefeat };
}
