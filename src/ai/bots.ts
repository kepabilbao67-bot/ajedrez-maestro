import type { DifficultyLevel, PlayStyle } from './types';

export interface AiBot {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly description: string;
  readonly greeting: string;
  readonly difficulty: DifficultyLevel;
  readonly playStyle: PlayStyle;
}

export const AI_BOTS: readonly AiBot[] = [
  {
    id: 'lucas',
    name: 'Lucas',
    avatar: '👦',
    description: 'Principiante entusiasta',
    greeting: '¡Hola! Estoy aprendiendo a mover los caballos, ¿jugamos?',
    difficulty: 2,
    playStyle: 'Balanced',
  },
  {
    id: 'elena',
    name: 'Elena',
    avatar: '👩‍🎤',
    description: 'Jugadora de club agresiva',
    greeting: 'Prepárate para defender a tu rey.',
    difficulty: 6,
    playStyle: 'Tactical',
  },
  {
    id: 'magnus',
    name: 'Maestro Magnus',
    avatar: '🧙‍♂️',
    description: 'Gran Maestro legendario',
    greeting: 'El ajedrez es comprensión pura. Veamos qué tienes.',
    difficulty: 8,
    playStyle: 'Positional',
  },
];
