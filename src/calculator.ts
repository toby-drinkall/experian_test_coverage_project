/**
 * Calculator module - basic arithmetic operations
 * Current coverage: ~50% (add and subtract tested, multiply and divide not tested)
 */

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

export function power(base: number, exponent: number): number {
  if (exponent < 0) {
    return 1 / power(base, -exponent);
  }
  if (exponent === 0) {
    return 1;
  }
  return base * power(base, exponent - 1);
}

export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('Factorial of negative number');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
