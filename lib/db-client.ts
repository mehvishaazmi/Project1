import type {
  DbOperation,
} from "@/lib/mysql-server";

type DbResult = {
  data: any;
  error: any;
  count?: null;
};

type QueryState = Omit<
  DbOperation,
  "action"
> & {
  action: DbOperation["action"];
};

async function executeOperation(
  operation: DbOperation,
): Promise<DbResult> {
  if (typeof window === "undefined") {
    const {
      runDbOperation,
    } = await import("@/lib/mysql-server");

    return runDbOperation(operation);
  }

  const response = await fetch("/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(operation),
  });

  return response.json();
}

function createQuery(table: string) {
  const state: QueryState = {
    table,
    action: "select",
    filters: [],
    orderBy: null,
    limit: null,
    single: false,
  };

  const query: any = {
    select(columns?: string) {
      state.action = "select";
      state.select = columns;
      return query;
    },
    eq(column: string, value: unknown) {
      state.filters?.push({
        column,
        op: "eq",
        value,
      });
      return query;
    },
    neq(column: string, value: unknown) {
      state.filters?.push({
        column,
        op: "neq",
        value,
      });
      return query;
    },
    in(column: string, value: unknown[]) {
      state.filters?.push({
        column,
        op: "in",
        value,
      });
      return query;
    },
    order(
      column: string,
      options?: {
        ascending?: boolean;
      },
    ) {
      state.orderBy = {
        column,
        ascending: options?.ascending ?? true,
      };
      return query;
    },
    limit(count: number) {
      state.limit = count;
      return query;
    },
    single() {
      state.single = true;
      return query;
    },
    maybeSingle() {
      state.single = true;
      return query;
    },
    insert(payload: unknown) {
      state.action = "insert";
      state.payload = payload;
      return query;
    },
    update(payload: unknown) {
      state.action = "update";
      state.payload = payload;
      return query;
    },
    delete() {
      state.action = "delete";
      return query;
    },
    then(
      resolve: (value: DbResult) => void,
      reject?: (reason: unknown) => void,
    ) {
      return executeOperation(state).then(resolve, reject);
    },
  };

  return query;
}

export const dbClient = {
  from(table: string) {
    return createQuery(table);
  },
  channel(_name?: string) {
    return {
      on(
        _event?: string,
        _filter?: unknown,
        _callback?: unknown,
      ) {
        return this;
      },
      subscribe() {
        return this;
      },
    };
  },
  removeChannel(_channel?: unknown) {
    return Promise.resolve("ok");
  },
};
