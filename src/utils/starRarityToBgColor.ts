export function starRarityToBgColor(starRarity: number): string {
  return starRarity === 5
    ? "#da8d25"
    : starRarity === 4
    ? "#B187C3"
    : "#9aa0a6";
}
