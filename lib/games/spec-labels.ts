/** İngilizce / teknik anahtarları mağaza arayüzünde Türkçeleştirir. */
const MAP: Record<string, string> = {
  os: "İşletim sistemi",
  processor: "İşlemci",
  memory: "Bellek",
  ram: "Bellek",
  graphics: "Ekran kartı",
  gpu: "Ekran kartı",
  directx: "DirectX",
  storage: "Depolama",
  disk: "Depolama",
  sound: "Ses",
  soundcard: "Ses kartı",
  network: "Ağ",
  additional: "Ek notlar",
  notes: "Notlar",
};

export function specLabelTr(key: string): string {
  const n = key.trim().toLowerCase().replace(/\s+/g, " ");
  return MAP[n] ?? key.replace(/_/g, " ");
}
