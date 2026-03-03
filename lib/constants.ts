export const WAREHOUSES = [
  {
    country: "Южная Корея",
    originCode: "KR",
    city: "Сеул",
    address: "서울특별시 구로구 디지털로 300, 1층",
    flag: "🇰🇷",
  },
  {
    country: "Китай",
    originCode: "CN",
    city: "Гуанчжоу",
    address: "广州市白云区机场路888号, 1楼",
    flag: "🇨🇳",
  },
  {
    country: "Турция",
    originCode: "TR",
    city: "Стамбул",
    address: "Laleli, Ordu Cd. No:12, Fatih/İstanbul",
    flag: "🇹🇷",
  },
] as const;

export const COUNTRY_NAMES: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

export const TRANSPORT_TYPES: Record<string, string> = {
  air: "Авиа",
  rail: "Ж/Д",
  sea: "Море",
  combined: "Комбинированный",
};
