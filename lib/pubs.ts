export interface Pub {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  lat: number;
  lng: number;
  showingMatch: boolean;
  distance?: number;
}

export const PUBS: Pub[] = [
  {
    id: 1,
    name: "The Scotsman",
    address: "Karl Johans gate 17, 0159 Oslo",
    phone: "+47 22 41 20 20",
    website: "https://thescotsman.no",
    lat: 59.9133,
    lng: 10.7389,
    showingMatch: true,
  },
  {
    id: 2,
    name: "Lorry",
    address: "Parkveien 12, 0350 Oslo",
    phone: "+47 22 69 69 04",
    website: "https://lorry.no",
    lat: 59.9221,
    lng: 10.7191,
    showingMatch: true,
  },
  {
    id: 3,
    name: "The Dubliner",
    address: "Rådhusgate 28, 0151 Oslo",
    phone: "+47 22 33 70 05",
    website: "https://thedubliner.no",
    lat: 59.9103,
    lng: 10.7352,
    showingMatch: true,
  },
  {
    id: 4,
    name: "Olympen",
    address: "Grønlandsleiret 15, 0190 Oslo",
    phone: "+47 22 17 28 08",
    website: "https://olympen.no",
    lat: 59.9089,
    lng: 10.7612,
    showingMatch: true,
  },
  {
    id: 5,
    name: "Bar Boca",
    address: "Thorvald Meyers gate 30, 0555 Oslo",
    phone: "+47 22 04 13 77",
    website: "https://barboca.no",
    lat: 59.9228,
    lng: 10.7591,
    showingMatch: false,
  },
  {
    id: 6,
    name: "Rock-n-Bowl",
    address: "Rosenkrantz gate 11, 0160 Oslo",
    phone: "+47 22 42 19 00",
    website: "https://rocknbowl.no",
    lat: 59.912,
    lng: 10.7378,
    showingMatch: true,
  },
  {
    id: 7,
    name: "Internasjonalen",
    address: "Youngstorget 2, 0181 Oslo",
    phone: "+47 22 99 22 99",
    website: "https://internasjonalen.no",
    lat: 59.9152,
    lng: 10.748,
    showingMatch: true,
  },
  {
    id: 8,
    name: "Kulturhuset",
    address: "Youngs gate 6, 0181 Oslo",
    phone: "+47 22 99 22 00",
    website: "https://kulturhuset.oslo.no",
    lat: 59.9158,
    lng: 10.7473,
    showingMatch: false,
  },
  {
    id: 9,
    name: "Brasserie Hansken",
    address: "Youngs gate 2B, 0181 Oslo",
    phone: "+47 22 42 60 88",
    website: "https://hansken.no",
    lat: 59.9148,
    lng: 10.7465,
    showingMatch: true,
  },
  {
    id: 10,
    name: "Revolver",
    address: "Møllergata 32, 0179 Oslo",
    phone: "+47 22 20 22 32",
    website: "https://revelverbar.no",
    lat: 59.9168,
    lng: 10.752,
    showingMatch: true,
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
