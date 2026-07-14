export interface ExactRational {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

const absolute = (value: bigint): bigint => (value < 0n ? -value : value);

const greatestCommonDivisor = (left: bigint, right: bigint): bigint => {
  let a = absolute(left);
  let b = absolute(right);

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
};

export const createRational = (
  numerator: bigint,
  denominator: bigint = 1n
): ExactRational => {
  if (denominator === 0n) {
    throw new RangeError("Rational denominator must not be zero");
  }

  if (numerator === 0n) {
    return { numerator: 0n, denominator: 1n };
  }

  const sign = denominator < 0n ? -1n : 1n;
  const normalizedNumerator = numerator * sign;
  const normalizedDenominator = denominator * sign;
  const divisor = greatestCommonDivisor(
    normalizedNumerator,
    normalizedDenominator
  );

  return {
    numerator: normalizedNumerator / divisor,
    denominator: normalizedDenominator / divisor,
  };
};

export const addRationals = (
  left: ExactRational,
  right: ExactRational
): ExactRational =>
  createRational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator
  );

export const compareRationals = (
  left: ExactRational,
  right: ExactRational
): -1 | 0 | 1 => {
  const normalizedLeft = createRational(left.numerator, left.denominator);
  const normalizedRight = createRational(right.numerator, right.denominator);
  const difference =
    normalizedLeft.numerator * normalizedRight.denominator -
    normalizedRight.numerator * normalizedLeft.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};

export const rationalKey = (value: ExactRational): string => {
  const normalized = createRational(value.numerator, value.denominator);
  return `${normalized.numerator}/${normalized.denominator}`;
};

export const rationalToNumber = (value: ExactRational): number =>
  Number(value.numerator) / Number(value.denominator);

export const rationalFromFiniteDecimal = (value: number): ExactRational => {
  if (!Number.isFinite(value)) {
    throw new RangeError("Decimal value must be finite");
  }
  const [coefficient, exponentText = "0"] = value
    .toString()
    .toLowerCase()
    .split("e");
  const exponent = Number(exponentText);
  const negative = coefficient.startsWith("-");
  const unsigned = negative ? coefficient.slice(1) : coefficient;
  const [whole, fraction = ""] = unsigned.split(".");
  const digits = BigInt(`${whole || "0"}${fraction}` || "0");
  const signedDigits = negative ? -digits : digits;
  const scale = fraction.length - exponent;
  return scale <= 0
    ? createRational(signedDigits * 10n ** BigInt(-scale), 1n)
    : createRational(signedDigits, 10n ** BigInt(scale));
};
