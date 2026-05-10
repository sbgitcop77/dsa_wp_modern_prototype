export type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
  isActive: boolean;
  totalSessionsDelivered: number;
  upcomingSessions: number;
  createdAt: string;
  deactivatedAt?: string;
};

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "marcus@diamondsports.com",
    speciality: "Hitting & Pitching",
    isActive: true,
    totalSessionsDelivered: 142,
    upcomingSessions: 6,
    createdAt: "2025-01-10T09:00:00Z",
  },
  {
    id: "i2",
    firstName: "Sofia",
    lastName: "Chen",
    email: "sofia@diamondsports.com",
    speciality: "Pitching & Defense",
    isActive: true,
    totalSessionsDelivered: 98,
    upcomingSessions: 4,
    createdAt: "2025-02-15T09:00:00Z",
  },
  {
    id: "i3",
    firstName: "Derek",
    lastName: "Williams",
    email: "derek@diamondsports.com",
    speciality: "Catching & Fielding",
    isActive: true,
    totalSessionsDelivered: 77,
    upcomingSessions: 3,
    createdAt: "2025-03-01T09:00:00Z",
  },
  {
    id: "i4",
    firstName: "Jordan",
    lastName: "Smith",
    email: "jordan@diamondsports.com",
    speciality: "Speed & Agility",
    isActive: false,
    totalSessionsDelivered: 34,
    upcomingSessions: 0,
    createdAt: "2025-01-20T09:00:00Z",
    deactivatedAt: "2025-11-01T09:00:00Z",
  },
];
