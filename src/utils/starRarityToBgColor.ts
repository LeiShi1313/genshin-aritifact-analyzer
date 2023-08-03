export function starRarityToBgColor(starRarity: number): string {
  return (
    "bg-" +
    (starRarity === 5
      ? "[#da8d25]"
      : starRarity === 4
      ? "[#B187C3]"
      : "base-200")
  );
}
