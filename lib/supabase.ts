// lib/supabase.ts

import {
  createClient,
} from "@supabase/supabase-js";

import { isDemoMode } from "@/lib/demo-mode";

const now = new Date().toISOString();

const demoTables: Record<string, any[]> = {
  trips: [
    {
      id: "demo-trip-bali",
      user_id: "demo-user",
      destination: "Bali",
      days: "5",
      budget: "45000",
      created_at: now,
      invite_code: "BALI123",
      plan: null,
    },
    {
      id: "demo-trip-tokyo",
      user_id: "demo-user",
      destination: "Tokyo",
      days: "7",
      budget: "120000",
      created_at: now,
      invite_code: "TOKYO456",
      plan: null,
    },
  ],
  buddy_profiles: [
    {
      id: "demo-buddy-1",
      user_id: "demo-buddy-1",
      name: "Aarav Mehta",
      age: 27,
      city: "Mumbai",
      bio: "Food walks, sunrise hikes, and flexible itineraries.",
      interests: ["Food", "Nature", "Photography"],
      avatar_initials: "AM",
      gradient: "from-primary to-accent",
      is_verified: true,
    },
    {
      id: "demo-buddy-2",
      user_id: "demo-buddy-2",
      name: "Maya Rao",
      age: 25,
      city: "Bengaluru",
      bio: "Museums, markets, and budget-friendly stays.",
      interests: ["Culture", "Shopping", "Budget"],
      avatar_initials: "MR",
      gradient: "from-accent to-primary",
      is_verified: true,
    },
  ],
  saved_buddies: [
    {
      id: "demo-saved-1",
      saver_user_id: "demo-user",
      saved_user_id: "demo-buddy-1",
      buddy_profiles: {
        id: "demo-buddy-1",
        user_id: "demo-buddy-1",
        name: "Aarav Mehta",
        avatar_initials: "AM",
        gradient: "from-primary to-accent",
        city: "Mumbai",
      },
    },
  ],
  trip_members: [
    {
      id: "demo-member-1",
      trip_id: "demo-trip-bali",
      user_id: "demo-user",
      user_name: "Travel User",
    },
    {
      id: "demo-member-2",
      trip_id: "demo-trip-bali",
      user_id: "demo-buddy-1",
      user_name: "Aarav Mehta",
    },
  ],
  expenses: [
    {
      id: "demo-expense-1",
      trip_id: "demo-trip-bali",
      user_id: "demo-user",
      title: "Villa stay",
      description: "Villa stay",
      amount: 18000,
      category: "Hotel",
      paid_by: "demo-user",
      paid_by_name: "Travel User",
      split_count: 2,
      created_at: now,
    },
  ],
  expense_splits: [],
  messages: [],
  settlements: [],
};

type DemoResult = {
  data: any;
  error: null;
  count?: null;
};

function applyFilters(rows: any[], filters: Array<[string, any]>) {
  return filters.reduce(
    (current, [column, value]) =>
      current.filter((row) => row?.[column] === value),
    rows,
  );
}

function createDemoQuery(table: string) {
  let rows = [...(demoTables[table] ?? [])];
  const filters: Array<[string, any]> = [];
  let shouldSingle = false;
  let limitCount: number | null = null;

  const resolve = (): DemoResult => {
    let data = applyFilters(rows, filters);

    if (limitCount !== null) {
      data = data.slice(0, limitCount);
    }

    return {
      data: shouldSingle ? data[0] ?? null : data,
      error: null,
    };
  };

  const query: any = {
    select() {
      return query;
    },
    eq(column: string, value: any) {
      filters.push([column, value]);
      return query;
    },
    neq(column: string, value: any) {
      rows = rows.filter((row) => row?.[column] !== value);
      return query;
    },
    in(column: string, values: any[]) {
      rows = rows.filter((row) => values.includes(row?.[column]));
      return query;
    },
    order() {
      return query;
    },
    limit(count: number) {
      limitCount = count;
      return query;
    },
    single() {
      shouldSingle = true;
      return query;
    },
    maybeSingle() {
      shouldSingle = true;
      return query;
    },
    insert(value: any) {
      const inserted = Array.isArray(value) ? value : [value];
      rows = inserted.map((item, index) => ({
        id: item.id ?? `demo-${table}-${Date.now()}-${index}`,
        created_at: item.created_at ?? new Date().toISOString(),
        ...item,
      }));
      demoTables[table] = [...(demoTables[table] ?? []), ...rows];
      return query;
    },
    update(value: any) {
      rows = applyFilters(rows, filters).map((row) => ({
        ...row,
        ...value,
      }));
      return query;
    },
    delete() {
      rows = [];
      return query;
    },
    then(resolvePromise: (value: DemoResult) => void) {
      return Promise.resolve(resolve()).then(resolvePromise);
    },
  };

  return query;
}

const demoSupabase = {
  from(table: string) {
    return createDemoQuery(table);
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    };
  },
  removeChannel() {
    return Promise.resolve("ok");
  },
};

// ====================================
// CLIENT-SIDE SUPABASE INSTANCE
// ====================================
// SAFE FOR:
// - browser/client components
// - realtime subscriptions
// - public anon access
//
// NEVER use service role key here.
// ====================================

export const supabase =
  isDemoMode
    ? (demoSupabase as unknown as ReturnType<typeof createClient>)
    : createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
