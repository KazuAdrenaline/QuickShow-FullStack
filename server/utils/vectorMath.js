export function cosineSimilarity(a, b) {
  let dot = 0, A = 0, B = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    A += a[i] * a[i];
    B += b[i] * b[i];
  }
  return dot / (Math.sqrt(A) * Math.sqrt(B));
}
