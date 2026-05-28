import { hash } from "bcryptjs";

interface MockAdmin {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface MockReport {
  id: string;
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: Date;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  pdfPath: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockAssessment {
  id: string;
  studentName: string;
  mobile: string;
  classSection: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  createdAt: Date;
}

let admins: MockAdmin[] = [];
let reports: MockReport[] = [];
let assessments: MockAssessment[] = [];
let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  const hashedPassword = await hash("Admin@123", 12);
  admins.push({
    id: "mock-admin-1",
    email: "admin@psychtest.com",
    password: hashedPassword,
    createdAt: new Date(),
  });

  const sampleReports: Omit<MockReport, "id" | "createdAt" | "updatedAt">[] = [
    {
      studentName: "Arjun Mehta",
      mobile: "9876543210",
      classSection: "10-A",
      dateOfAssessment: new Date("2026-05-15"),
      scoreA: 4, scoreB: 2, scoreC: 3, scoreD: 1,
      pdfPath: "",
    },
    {
      studentName: "Priya Sharma",
      mobile: "9876543211",
      classSection: "10-B",
      dateOfAssessment: new Date("2026-05-16"),
      scoreA: 1, scoreB: 5, scoreC: 2, scoreD: 2,
      pdfPath: "",
    },
    {
      studentName: "Rohan Gupta",
      mobile: "9876543212",
      classSection: "10-A",
      dateOfAssessment: new Date("2026-05-17"),
      scoreA: 2, scoreB: 1, scoreC: 5, scoreD: 2,
      pdfPath: "",
    },
    {
      studentName: "Sneha Patel",
      mobile: "9876543213",
      classSection: "10-C",
      dateOfAssessment: new Date("2026-05-18"),
      scoreA: 1, scoreB: 2, scoreC: 1, scoreD: 6,
      pdfPath: "",
    },
  ];

  for (const r of sampleReports) {
    reports.push({
      ...r,
      id: `mock-report-${reports.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

function makeWhereFilter<T>(where: Record<string, unknown>) {
  return (item: T) =>
    Object.entries(where).every(
      ([key, val]) => (item as Record<string, unknown>)[key] === val
    );
}

function applySelect<T extends object>(
  item: T,
  select?: Record<string, boolean>
): Partial<T> {
  if (!select) return { ...item };
  const result: Record<string, unknown> = {};
  const rec = item as Record<string, unknown>;
  for (const [key, included] of Object.entries(select)) {
    if (included) result[key] = rec[key];
  }
  return result as Partial<T>;
}

function createModelDelegate<T extends object>(
  getData: () => T[],
  setData: (items: T[]) => void
) {
  return {
    async findUnique(args: { where: Record<string, unknown> }) {
      await ensureSeeded();
      return getData().find(makeWhereFilter<T>(args.where)) ?? null;
    },
    async findMany(args?: {
      orderBy?: Record<string, "asc" | "desc">;
      select?: Record<string, boolean>;
    }) {
      await ensureSeeded();
      let items = [...getData()];
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0];
        items.sort((a, b) => {
          const av = (a as Record<string, unknown>)[field] as string | number | Date;
          const bv = (b as Record<string, unknown>)[field] as string | number | Date;
          const cmp = av > bv ? 1 : av < bv ? -1 : 0;
          return dir === "desc" ? -cmp : cmp;
        });
      }
      return items.map((item) => applySelect(item, args?.select));
    },
    async create(args: { data: Record<string, unknown> }) {
      await ensureSeeded();
      const now = new Date();
      const newItem = {
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...args.data,
        createdAt: now,
        updatedAt: now,
      } as unknown as T;
      const items = getData();
      items.push(newItem);
      setData(items);
      return newItem;
    },
    async delete(args: { where: Record<string, unknown> }) {
      await ensureSeeded();
      const filter = makeWhereFilter<T>(args.where);
      const item = getData().find(filter);
      if (item) {
        setData(getData().filter((i) => !filter(i)));
      }
      return item ?? null;
    },
  };
}

export const mockPrisma = {
  admin: createModelDelegate<MockAdmin>(
    () => admins,
    (items) => { admins = items; }
  ),
  report: createModelDelegate<MockReport>(
    () => reports,
    (items) => { reports = items; }
  ),
  assessment: createModelDelegate<MockAssessment>(
    () => assessments,
    (items) => { assessments = items; }
  ),
  async $queryRaw() {
    return [{ "?column?": 1 }];
  },
};

export type MockPrisma = typeof mockPrisma;
