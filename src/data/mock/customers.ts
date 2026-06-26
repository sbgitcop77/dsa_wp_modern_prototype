export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isFlagged: boolean;
  noShowCount: number;
  lateCancellationCount: number;
  smsOptOut: boolean;
  source: "online_booking" | "admin_booking" | "import";
  createdAt: string;
  deactivatedAt?: string;
};

class RNG {
  private s: number;
  constructor(seed: number) { this.s = ((seed >>> 0) || 1) & 0x7fffffff; }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) & 0x7fffffff;
    return this.s / 0x7fffffff;
  }
  int(n: number) { return Math.floor(this.next() * n); }
  bool(p = 0.5) { return this.next() < p; }
  pick<T>(a: T[]): T { return a[this.int(a.length)]; }
}

const FIRST_NAMES = [
  "Ethan","Maya","Noah","Priya","Jacob","Sofia","Liam","Aisha","Connor","Riley",
  "Oliver","Emma","Benjamin","Ava","Lucas","Isabella","James","Mia","Henry","Charlotte",
  "Alexander","Amelia","Sebastian","Harper","Jack","Evelyn","Daniel","Aria","Owen","Luna",
  "Ryan","Chloe","Nathan","Zoey","Caleb","Penelope","Isaiah","Layla","Jonah","Nora",
  "Elijah","Lily","Andrew","Eleanor","Cameron","Violet","Adrian","Aurora","Marcus","Savannah",
  "Tyler","Stella","Jordan","Hazel","Kyle","Brooklyn","Brandon","Madeline","Evan","Aubrey",
  "Gavin","Paisley","Sean","Addison","Colin","Skylar","Dylan","Naomi","Derek","Aaliyah",
  "Aiden","Claire","Logan","Natalie","Bryce","Piper","Trevor","Willow","Garrett","Quinn",
];

const LAST_NAMES = [
  "Brooks","Thompson","Kim","Nair","Rivera","Chen","Johnson","Williams","Jones","Brown",
  "Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris",
  "Martin","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall",
  "Allen","Young","Hernandez","King","Wright","Lopez","Hill","Scott","Green","Adams",
  "Baker","Gonzalez","Nelson","Carter","Mitchell","Perez","Roberts","Turner","Phillips","Campbell",
  "Parker","Evans","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook",
  "Morgan","Bell","Murphy","Bailey","Cooper","Richardson","Cox","Howard","Ward","Torres",
  "Peterson","Gray","Ramirez","James","Watson","Kelly","Sanders",
];

const AREA_CODES = ["410","443","301","240","202","571","703","804","757"];

function generateCustomers(): Customer[] {
  const rng = new RNG(42);
  const now = Date.now();
  const customers: Customer[] = [];
  const emailSet = new Set<string>();

  for (let i = 1; i <= 150; i++) {
    const firstName = rng.pick(FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);

    const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}@email.com`;
    let email = baseEmail;
    if (emailSet.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${i}@email.com`;
    }
    emailSet.add(email);

    const areaCode = rng.pick(AREA_CODES);
    const digits = String(rng.int(9000) + 1000);
    const phone = `(${areaCode}) 555-${digits}`;

    const noShowCount = rng.bool(0.12) ? (rng.int(4) + 1) : 0;
    const lateCancellationCount = rng.bool(0.18) ? (rng.int(5) + 1) : 0;
    const isFlagged = noShowCount >= 2 || lateCancellationCount >= 3 || rng.bool(0.04);

    const isActive = rng.bool(0.9);
    const smsOptOut = rng.bool(0.15);

    const sourceR = rng.next();
    const source: Customer["source"] = sourceR < 0.6
      ? "online_booking"
      : sourceR < 0.85
        ? "admin_booking"
        : "import";

    const daysAgo = 30 + rng.int(701); // 30–730 days ago
    const createdAt = new Date(now - daysAgo * 86400000).toISOString().slice(0, 19) + "Z";

    let deactivatedAt: string | undefined;
    if (!isActive) {
      const deactivDaysAgo = rng.int(181); // 0–180 days ago
      deactivatedAt = new Date(now - deactivDaysAgo * 86400000).toISOString().slice(0, 19) + "Z";
    }

    customers.push({
      id: `c${i}`,
      firstName,
      lastName,
      email,
      phone,
      isActive,
      isFlagged,
      noShowCount,
      lateCancellationCount,
      smsOptOut,
      source,
      createdAt,
      ...(deactivatedAt ? { deactivatedAt } : {}),
    });
  }

  return customers;
}

export const MOCK_CUSTOMERS: Customer[] = generateCustomers();

export const CUSTOMER_POOL = MOCK_CUSTOMERS.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }));
