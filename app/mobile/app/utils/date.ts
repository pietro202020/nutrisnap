// utils/date.ts
export const localKey = (iso: string) =>
    new Date(iso).toLocaleDateString('sv-SE'); // szwedzki = 2025-06-23
  