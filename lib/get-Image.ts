export function getDestinationImage(destination: string) {
  const map: Record<string, string> = {
    goa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    manali: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
    bali: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f",
  };

  return (
    map[destination.toLowerCase()] ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  );
}