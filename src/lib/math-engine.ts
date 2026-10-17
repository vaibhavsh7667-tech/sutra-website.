import { create, all, ConfigOptions } from 'mathjs';
import { AngleMode } from '@/types/calculator';

const math = create(all, {
  number: 'number',
  precision: 14,
} as ConfigOptions);

// Safe mathematical formatting helper
export function cleanNumber(val: number, precision: number = 8): string {
  if (isNaN(val)) return 'Error: Indeterminate expression';
  if (!isFinite(val)) return 'Error: Division by zero or infinity';
  
  // Clean small float imprecisions like 1e-15 -> 0
  if (Math.abs(val) < 1e-13) return '0';

  // Fix floating point issues
  const fixed = parseFloat(val.toPrecision(precision));
  
  // Format scientific notation if extremely large or small
  if (Math.abs(fixed) >= 1e11 || (Math.abs(fixed) > 0 && Math.abs(fixed) < 1e-6)) {
    return fixed.toExponential(4);
  }
  
  return fixed.toString();
}

// Convert expression considering DEG / RAD mode
export function prepareExpression(expr: string, angleMode: AngleMode): string {
  let processed = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    // Superscripts and powers
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/x²/g, '^2')
    .replace(/x³/g, '^3')
    // Roots
    .replace(/³√\(/g, 'cbrt(')
    .replace(/³√([0-9a-zA-Z.]+)/g, 'cbrt($1)')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√([0-9a-zA-Z.]+)/g, 'sqrt($1)')
    .replace(/ʸ√\(([^,]+),\s*([^)]+)\)/g, 'nthRoot($1, $2)')
    // Inverse trig symbols
    .replace(/sin⁻¹\(/g, 'asin(')
    .replace(/cos⁻¹\(/g, 'acos(')
    .replace(/tan⁻¹\(/g, 'atan(')
    .replace(/sinh⁻¹\(/g, 'asinh(')
    .replace(/cosh⁻¹\(/g, 'acosh(')
    .replace(/tanh⁻¹\(/g, 'atanh(')
    // Percentage
    .replace(/([0-9.]+)%/g, '($1 * 0.01)')
    // EXP scientific notation
    .replace(/\bEXP\b/g, '*10^')
    // Logarithms
    .replace(/\bln\(/g, 'log(')
    .replace(/\blog\(/g, 'log10(');

  if (angleMode === 'DEG') {
    // Intercept inverse trig in DEG mode to output degrees
    processed = processed.replace(/\basin\(([^)]+)\)/g, '(asin($1) * 180 / pi)');
    processed = processed.replace(/\bacos\(([^)]+)\)/g, '(acos($1) * 180 / pi)');
    processed = processed.replace(/\batan\(([^)]+)\)/g, '(atan($1) * 180 / pi)');

    // Intercept direct sin, cos, tan for DEG mode input
    processed = processed.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
    processed = processed.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
    processed = processed.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
  }

  return processed;
}

export function evaluateExpression(
  expression: string,
  angleMode: AngleMode = 'DEG',
  scope: Record<string, unknown> = {}
): { success: boolean; result: string; numericValue?: number; error?: string } {
  if (!expression || expression.trim() === '') {
    return { success: false, result: '', error: 'Please enter a valid mathematical expression.' };
  }

  try {
    const sanitized = prepareExpression(expression.trim(), angleMode);
    const evaluated = math.evaluate(sanitized, scope);

    if (evaluated === undefined || evaluated === null) {
      return { success: false, result: '', error: 'Expression could not be evaluated.' };
    }

    if (typeof evaluated === 'number') {
      if (isNaN(evaluated)) {
        return { success: false, result: '', error: 'Result is undefined or indeterminate.' };
      }
      if (!isFinite(evaluated)) {
        return { success: false, result: '', error: 'Cannot divide by zero or result exceeds calculation limits.' };
      }
      return {
        success: true,
        result: cleanNumber(evaluated),
        numericValue: evaluated,
      };
    }

    // Complex number or matrix or unit
    if (evaluated && typeof evaluated.toString === 'function') {
      return {
        success: true,
        result: evaluated.toString(),
      };
    }

    return { success: true, result: String(evaluated) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    let friendlyError = 'Please check the syntax of your mathematical expression.';
    if (msg.includes('Parenthesis') || msg.includes('brackets')) {
      friendlyError = 'Mismatched parentheses or brackets.';
    } else if (msg.includes('Unexpected') || msg.includes('syntax')) {
      friendlyError = 'Syntax error. Ensure operators and numbers are arranged correctly.';
    } else if (msg.includes('Undefined symbol')) {
      const match = msg.match(/Undefined symbol ([a-zA-Z0-9_]+)/);
      friendlyError = match ? `Unknown variable or symbol: "${match[1]}".` : 'Unknown symbol in expression.';
    }
    return { success: false, result: '', error: friendlyError };
  }
}

// Function compiler for graphing y = f(x)
export function compileGraphFunction(expr: string): (x: number) => number | null {
  try {
    // Sanitize equation: strip "y =" or "f(x) ="
    let clean = expr.trim();
    if (clean.startsWith('y =') || clean.startsWith('y=')) {
      clean = clean.substring(clean.indexOf('=') + 1).trim();
    } else if (clean.startsWith('f(x) =') || clean.startsWith('f(x)=')) {
      clean = clean.substring(clean.indexOf('=') + 1).trim();
    }

    clean = clean
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt');

    // Handle implicit multiplication like 2x -> 2*x, 3x^2 -> 3*x^2
    clean = clean.replace(/([0-9])([xX])/g, '$1*$2');
    clean = clean.replace(/([xX])([0-9])/g, '$1*$2');

    const compiled = math.compile(clean);
    return (x: number) => {
      try {
        const val = compiled.evaluate({ x, pi: Math.PI, e: Math.E });
        if (typeof val === 'number' && isFinite(val) && !isNaN(val)) {
          return val;
        }
        return null;
      } catch {
        return null;
      }
    };
  } catch {
    return () => null;
  }
}

// Numerical derivative at point x
export function numericalDerivative(f: (x: number) => number | null, x: number, h: number = 1e-5): number | null {
  const y1 = f(x + h);
  const y0 = f(x - h);
  if (y1 === null || y0 === null) return null;
  return (y1 - y0) / (2 * h);
}

// Numerical integration (Simpson's Rule)
export function numericalIntegral(
  f: (x: number) => number | null,
  a: number,
  b: number,
  n: number = 1000
): { value: number | null; stepsExplanation: string } {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = 0;
  
  const fa = f(a);
  const fb = f(b);
  if (fa === null || fb === null) {
    return { value: null, stepsExplanation: 'Function is discontinuous or undefined within bounds.' };
  }
  
  sum = fa + fb;

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = f(x);
    if (y === null) return { value: null, stepsExplanation: 'Discontinuity encountered during integration.' };
    sum += (i % 2 === 0 ? 2 : 4) * y;
  }

  const result = (h / 3) * sum;
  return {
    value: result,
    stepsExplanation: `Integrated using Simpson's Composite Rule over [${a}, ${b}] with ${n} intervals. Step size h = ${h.toFixed(4)}.`,
  };
}
