export function noise(x, y) {
  let n = (Math.imul(y, 57) + x) | 0;
  n = ((n << 13) ^ n) | 0;
  let t = Math.imul(n, n);
  t = Math.imul(t, 15731);
  t = (t + 789221) | 0;
  t = Math.imul(n, t);
  t = (t + 1376312589) | 0;
  const term = t & 0x7fffffff;
  return 1.0 - term / 1073741824.0;
}
