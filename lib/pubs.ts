export interface Pub {
  id: number;
  name: string;
  neighborhood: string;
  address: string;
  phone: string;
  website: string;
  lat: number;
  lng: number;
  showingMatch: boolean;
  priceLevel: string;
  capacity: number;
  screens: number;
  features: string[];
  gradient: string;
  distance?: number;
}

export const PUBS: Pub[] = [
  {
    id: 1,
    name: "The Scotsman",
    neighborhood: "Sentrum",
    address: "Karl Johans gate 17, 0159 Oslo",
    phone: "+47 22 41 20 20",
    website: "https://thescotsman.no",
    lat: 59.9133,
    lng: 10.7389,
    showingMatch: true,
    priceLevel: "$$",
    capacity: 200,
    screens: 12,
    features: ["Lyd på", "Storskjerm", "Flere skjermer", "Uteplass"],
    gradient: "from-blue-900 to-indigo-950",
  },
  {
    id: 2,
    name: "Lorry",
    neighborhood: "Frogner",
    address: "Parkveien 12, 0350 Oslo",
    phone: "+47 22 69 69 04",
    website: "https://lorry.no",
    lat: 59.9221,
    lng: 10.7191,
    showingMatch: true,
    priceLevel: "$$",
    capacity: 120,
    screens: 6,
    features: ["Lyd på", "Storskjerm", "Uteplass"],
    gradient: "from-amber-900 to-stone-950",
  },
  {
    id: 3,
    name: "The Dubliner",
    neighborhood: "Sentrum",
    address: "Rådhusgate 28, 0151 Oslo",
    phone: "+47 22 33 70 05",
    website: "https://thedubliner.no",
    lat: 59.9103,
    lng: 10.7352,
    showingMatch: true,
    priceLevel: "$$",
    capacity: 150,
    screens: 8,
    features: ["Lyd på", "Storskjerm", "Flere skjermer"],
    gradient: "from-green-900 to-emerald-950",
  },
  {
    id: 4,
    name: "Olympen",
    neighborhood: "Grønland",
    address: "Grønlandsleiret 15, 0190 Oslo",
    phone: "+47 22 17 28 08",
    website: "https://olympen.no",
    lat: 59.9089,
    lng: 10.7612,
    showingMatch: true,
    priceLevel: "$",
    capacity: 300,
    screens: 15,
    features: ["Lyd på", "Storskjerm", "Flere skjermer", "Uteplass"],
    gradient: "from-red-900 to-rose-950",
  },
  {
    id: 5,
    name: "Bar Boca",
    neighborhood: "Grünerløkka",
    address: "Thorvald Meyers gate 30, 0555 Oslo",
    phone: "+47 22 04 13 77",
    website: "https://barboca.no",
    lat: 59.9228,
    lng: 10.7591,
    showingMatch: false,
    priceLevel: "$$",
    capacity: 80,
    screens: 2,
    features: ["Uteplass"],
    gradient: "from-purple-900 to-violet-950",
  },
  {
    id: 6,
    name: "Rock-n-Bowl",
    neighborhood: "Sentrum",
    address: "Rosenkrantz gate 11, 0160 Oslo",
    phone: "+47 22 42 19 00",
    website: "https://rocknbowl.no",
    lat: 59.912,
    lng: 10.7378,
    showingMatch: true,
    priceLevel: "$$",
    capacity: 100,
    screens: 6,
    features: ["Lyd på", "Storskjerm", "Bar"],
    gradient: "from-zinc-800 to-zinc-950",
  },
  {
    id: 7,
    name: "Internasjonalen",
    neighborhood: "Sentrum",
    address: "Youngstorget 2, 0181 Oslo",
    phone: "+47 22 99 22 99",
    website: "https://internasjonalen.no",
    lat: 59.9152,
    lng: 10.748,
    showingMatch: true,
    priceLevel: "$",
    capacity: 250,
    screens: 10,
    features: ["Lyd på", "Storskjerm", "Uteplass", "Flere skjermer"],
    gradient: "from-orange-900 to-amber-950",
  },
  {
    id: 8,
    name: "Kulturhuset",
    neighborhood: "Sentrum",
    address: "Youngs gate 6, 0181 Oslo",
    phone: "+47 22 99 22 00",
    website: "https://kulturhuset.oslo.no",
    lat: 59.9158,
    lng: 10.7473,
    showingMatch: false,
    priceLevel: "$",
    capacity: 180,
    screens: 4,
    features: ["Uteplass", "Bar"],
    gradient: "from-teal-900 to-cyan-950",
  },
  {
    id: 9,
    name: "Brasserie Hansken",
    neighborhood: "Sentrum",
    address: "Youngs gate 2B, 0181 Oslo",
    phone: "+47 22 42 60 88",
    website: "https://hansken.no",
    lat: 59.9148,
    lng: 10.7465,
    showingMatch: true,
    priceLevel: "$$$",
    capacity: 90,
    screens: 4,
    features: ["Lyd på", "Storskjerm"],
    gradient: "from-yellow-900 to-stone-950",
  },
  {
    id: 10,
    name: "Revolver",
    neighborhood: "Sentrum",
    address: "Møllergata 32, 0179 Oslo",
    phone: "+47 22 20 22 32",
    website: "https://revelverbar.no",
    lat: 59.9168,
    lng: 10.752,
    showingMatch: true,
    priceLevel: "$",
    capacity: 130,
    screens: 7,
    features: ["Lyd på", "Storskjerm", "Flere skjermer", "Bar"],
    gradient: "from-slate-800 to-slate-950",
  },
];

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getNearestPubs(
  userLat: number,
  userLng: number,
  count = 3
): Pub[] {
  return PUBS.map((pub) => ({
    ...pub,
    distance: haversineDistance(userLat, userLng, pub.lat, pub.lng),
  }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, count);
}
