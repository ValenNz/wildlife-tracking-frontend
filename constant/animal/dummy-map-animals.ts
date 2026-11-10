
export type DummyMapAnimal = {
  id: string;
  name: string;
  speciesId: number;
  latitude: number;
  longitude: number;
  status: string;
  recordedAt: string;
};

export const DUMMY_MAP_ANIMALS: DummyMapAnimal[] = [
  {
    id: "ORN-001",
    name: "Orangutan Sumatra",
    speciesId: 1,
    latitude: 3.55,
    longitude: 97.35,
    status: "Terpantau",
    recordedAt: "2026-10-27T10:00:00",
  },
  {
    id: "HRM-002",
    name: "Harimau Sumatra",
    speciesId: 2,
    latitude: 3.6,
    longitude: 97.4,
    status: "Terpantau",
    recordedAt: "2026-10-27T10:05:00",
  },
  {
    id: "BDK-001",
    name: "Badak Sumatra",
    speciesId: 3,
    latitude: 3.5,
    longitude: 97.3,
    status: "Terpantau",
    recordedAt: "2026-10-27T10:10:00",
  },
];
