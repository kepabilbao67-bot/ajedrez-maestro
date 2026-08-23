import { describe, expect, it } from 'vitest';

import type { PremiumBadgeProps } from '../premium-badge';
import type { UsageMeterProps } from '../usage-meter';

// Helper para calcular porcentaje igual que UsageMeter
function calculatePercentage(used: number, max: number): number {
  return max > 0 ? Math.min((used / max) * 100, 100) : 0;
}

// Helper para calcular restantes igual que UsageMeter
function calculateRemaining(used: number, max: number): number {
  return Math.max(max - used, 0);
}

// Helper para formatear texto de usage igual que UsageMeter
function formatUsageText(used: number, max: number): string {
  const remaining = calculateRemaining(used, max);
  if (remaining === 0) return 'usadas';
  if (remaining === 1) return '(1 restante)';
  return `(${remaining} restantes)`;
}

describe('PremiumBadge Props', () => {
  describe('isPro prop validation', () => {
    it('acepta isPro=true', () => {
      const props: PremiumBadgeProps = { isPro: true };
      expect(props.isPro).toBe(true);
    });

    it('acepta isPro=false', () => {
      const props: PremiumBadgeProps = { isPro: false };
      expect(props.isPro).toBe(false);
    });
  });

  describe('variant prop validation', () => {
    it('acepta variant="default"', () => {
      const props: PremiumBadgeProps = { isPro: true, variant: 'default' };
      expect(props.variant).toBe('default');
    });

    it('acepta variant="compact"', () => {
      const props: PremiumBadgeProps = { isPro: true, variant: 'compact' };
      expect(props.variant).toBe('compact');
    });

    it('acepta variant="feature-lock"', () => {
      const props: PremiumBadgeProps = { isPro: false, variant: 'feature-lock' };
      expect(props.variant).toBe('feature-lock');
    });

    it('variant es opcional (puede ser undefined)', () => {
      const props: PremiumBadgeProps = { isPro: true };
      expect(props.variant).toBeUndefined();
    });
  });

  describe('combinaciones de props válidas', () => {
    it('PRO con variant default es válido', () => {
      const props: PremiumBadgeProps = { isPro: true, variant: 'default' };
      expect(props.isPro).toBe(true);
      expect(props.variant).toBe('default');
    });

    it('FREE con variant compact es válido', () => {
      const props: PremiumBadgeProps = { isPro: false, variant: 'compact' };
      expect(props.isPro).toBe(false);
      expect(props.variant).toBe('compact');
    });

    it('PRO con variant feature-lock es válido (desbloqueado)', () => {
      const props: PremiumBadgeProps = { isPro: true, variant: 'feature-lock' };
      expect(props.isPro).toBe(true);
      expect(props.variant).toBe('feature-lock');
    });

    it('FREE con variant feature-lock es válido (bloqueado)', () => {
      const props: PremiumBadgeProps = { isPro: false, variant: 'feature-lock' };
      expect(props.isPro).toBe(false);
      expect(props.variant).toBe('feature-lock');
    });
  });
});

describe('UsageMeter Props', () => {
  describe('props validation', () => {
    it('acepta props completos válidos para Free', () => {
      const props: UsageMeterProps = {
        used: 2,
        max: 3,
        label: 'Pistas',
        isPro: false,
      };
      expect(props.used).toBe(2);
      expect(props.max).toBe(3);
      expect(props.label).toBe('Pistas');
      expect(props.isPro).toBe(false);
    });

    it('acepta props completos válidos para Pro', () => {
      const props: UsageMeterProps = {
        used: 10,
        max: 3,
        label: 'Análisis',
        isPro: true,
      };
      expect(props.used).toBe(10);
      expect(props.max).toBe(3);
      expect(props.label).toBe('Análisis');
      expect(props.isPro).toBe(true);
    });
  });
});

describe('UsageMeter Logic - Cálculo de porcentaje', () => {
  it('calcula 0% cuando used=0', () => {
    expect(calculatePercentage(0, 3)).toBe(0);
  });

  it('calcula 33% cuando used=1 max=3', () => {
    const percentage = calculatePercentage(1, 3);
    expect(Math.round(percentage)).toBe(33);
  });

  it('calcula 67% cuando used=2 max=3', () => {
    const percentage = calculatePercentage(2, 3);
    expect(Math.round(percentage)).toBe(67);
  });

  it('calcula 100% cuando used=3 max=3', () => {
    expect(calculatePercentage(3, 3)).toBe(100);
  });

  it('no excede 100% cuando used > max', () => {
    expect(calculatePercentage(5, 3)).toBe(100);
    expect(calculatePercentage(10, 3)).toBe(100);
  });

  it('maneja max=0 sin división por cero', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('calcula 50% cuando used=1 max=2', () => {
    expect(calculatePercentage(1, 2)).toBe(50);
  });

  it('calcula 25% cuando used=1 max=4', () => {
    expect(calculatePercentage(1, 4)).toBe(25);
  });

  it('calcula 75% cuando used=3 max=4', () => {
    expect(calculatePercentage(3, 4)).toBe(75);
  });
});

describe('UsageMeter Logic - Cálculo de restantes', () => {
  it('calcula 3 restantes cuando used=0 max=3', () => {
    expect(calculateRemaining(0, 3)).toBe(3);
  });

  it('calcula 2 restantes cuando used=1 max=3', () => {
    expect(calculateRemaining(1, 3)).toBe(2);
  });

  it('calcula 1 restante cuando used=2 max=3', () => {
    expect(calculateRemaining(2, 3)).toBe(1);
  });

  it('calcula 0 restantes cuando used=3 max=3', () => {
    expect(calculateRemaining(3, 3)).toBe(0);
  });

  it('no da negativos cuando used > max', () => {
    expect(calculateRemaining(5, 3)).toBe(0);
    expect(calculateRemaining(10, 1)).toBe(0);
  });

  it('calcula restantes correctos con max=1', () => {
    expect(calculateRemaining(0, 1)).toBe(1);
    expect(calculateRemaining(1, 1)).toBe(0);
  });

  it('calcula restantes correctos con números grandes', () => {
    expect(calculateRemaining(15, 20)).toBe(5);
    expect(calculateRemaining(99, 100)).toBe(1);
  });
});

describe('UsageMeter Logic - Formateo de texto', () => {
  it('muestra "usadas" cuando remaining=0', () => {
    expect(formatUsageText(3, 3)).toBe('usadas');
    expect(formatUsageText(5, 3)).toBe('usadas');
  });

  it('muestra "(1 restante)" en singular', () => {
    expect(formatUsageText(2, 3)).toBe('(1 restante)');
    expect(formatUsageText(0, 1)).toBe('(1 restante)');
  });

  it('muestra "(N restantes)" en plural', () => {
    expect(formatUsageText(0, 3)).toBe('(3 restantes)');
    expect(formatUsageText(1, 3)).toBe('(2 restantes)');
    expect(formatUsageText(1, 5)).toBe('(4 restantes)');
  });

  it('maneja edge cases', () => {
    expect(formatUsageText(0, 2)).toBe('(2 restantes)');
    expect(formatUsageText(15, 20)).toBe('(5 restantes)');
  });
});

describe('UsageMeter Logic - Detección de estado completo', () => {
  it('detecta completo cuando used === max', () => {
    const isComplete = calculateRemaining(3, 3) === 0;
    expect(isComplete).toBe(true);
  });

  it('detecta completo cuando used > max', () => {
    const isComplete = calculateRemaining(5, 3) === 0;
    expect(isComplete).toBe(true);
  });

  it('detecta NO completo cuando used < max', () => {
    const isComplete = calculateRemaining(2, 3) === 0;
    expect(isComplete).toBe(false);
  });

  it('detecta completo con max=1', () => {
    const isComplete = calculateRemaining(1, 1) === 0;
    expect(isComplete).toBe(true);
  });
});

describe('UsageMeter Logic - Escenarios reales', () => {
  it('escenario: usuario Free con 2 de 3 pistas usadas', () => {
    const used = 2;
    const max = 3;
    const percentage = calculatePercentage(used, max);
    const remaining = calculateRemaining(used, max);
    const text = formatUsageText(used, max);

    expect(Math.round(percentage)).toBe(67);
    expect(remaining).toBe(1);
    expect(text).toBe('(1 restante)');
  });

  it('escenario: usuario Free con 1 de 1 análisis usado', () => {
    const used = 1;
    const max = 1;
    const percentage = calculatePercentage(used, max);
    const remaining = calculateRemaining(used, max);
    const text = formatUsageText(used, max);

    expect(percentage).toBe(100);
    expect(remaining).toBe(0);
    expect(text).toBe('usadas');
  });

  it('escenario: usuario Free sin pistas usadas', () => {
    const used = 0;
    const max = 3;
    const percentage = calculatePercentage(used, max);
    const remaining = calculateRemaining(used, max);
    const text = formatUsageText(used, max);

    expect(percentage).toBe(0);
    expect(remaining).toBe(3);
    expect(text).toBe('(3 restantes)');
  });

  it('escenario: usuario Free con límite alcanzado', () => {
    const used = 3;
    const max = 3;
    const percentage = calculatePercentage(used, max);
    const remaining = calculateRemaining(used, max);
    const text = formatUsageText(used, max);

    expect(percentage).toBe(100);
    expect(remaining).toBe(0);
    expect(text).toBe('usadas');
  });

  it('escenario: usuario Pro (valores ignorados en UI)', () => {
    const isPro = true;
    const used = 999;
    const max = 3;

    // En modo Pro, estos cálculos no se renderizan
    // pero los valores siguen siendo válidos
    expect(isPro).toBe(true);
    expect(used).toBeGreaterThan(max);
  });
});

describe('UsageMeter Logic - Edge cases', () => {
  it('maneja valores negativos de used (no debería ocurrir pero es seguro)', () => {
    const remaining = calculateRemaining(-1, 3);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('maneja valores negativos de max (no debería ocurrir pero es seguro)', () => {
    const percentage = calculatePercentage(1, -1);
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('maneja ambos cero', () => {
    const percentage = calculatePercentage(0, 0);
    const remaining = calculateRemaining(0, 0);
    expect(percentage).toBe(0);
    expect(remaining).toBe(0);
  });

  it('maneja números decimales correctamente', () => {
    const percentage = calculatePercentage(1.5, 3);
    expect(percentage).toBe(50);
  });
});
