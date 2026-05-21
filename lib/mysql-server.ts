import mysql from "mysql2/promise";

type Filter = {
  column: string;
  op: "eq" | "neq" | "in";
  value: unknown;
};

export type DbOperation = {
  table: string;
  action: "select" | "insert" | "update" | "delete";
  select?: string;
  filters?: Filter[];
  orderBy?: {
    column: string;
    ascending: boolean;
  } | null;
  limit?: number | null;
  single?: boolean;
  payload?: unknown;
};

const databaseUrl = process.env.DATABASE_URL;
const mysqlDatabase =
  process.env.MYSQL_DATABASE || "travelbuddy";

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
    });

const jsonColumns = new Set([
  "plan",
  "interests",
  "split_with",
]);

const allowedTables = new Set([
  "trips",
  "trip_members",
  "expenses",
  "expense_splits",
  "settlements",
  "buddy_profiles",
  "saved_buddies",
  "messages",
  "trip_buddies",
  "orders",
  "payments",
]);

let schemaReady: Promise<void> | null = null;

function assertTable(table: string) {
  if (!allowedTables.has(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
}

function normalizeValue(key: string, value: unknown) {
  if (jsonColumns.has(key) && value !== null && value !== undefined) {
    return typeof value === "string" ? value : JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return value;
}

function parseRow(row: Record<string, unknown>) {
  const parsed: Record<string, unknown> = {
    ...row,
  };

  for (const key of jsonColumns) {
    const value = parsed[key];

    if (typeof value === "string") {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value;
      }
    }
  }

  return parsed;
}

function buildWhere(filters: Filter[] = []) {
  if (!filters.length) {
    return {
      clause: "",
      values: [] as unknown[],
    };
  }

  const parts: string[] = [];
  const values: unknown[] = [];

  for (const filter of filters) {
    if (filter.op === "in") {
      const list = Array.isArray(filter.value) ? filter.value : [];

      if (!list.length) {
        parts.push("1 = 0");
        continue;
      }

      parts.push(
        `\`${filter.column}\` IN (${list.map(() => "?").join(", ")})`,
      );
      values.push(...list);
      continue;
    }

    parts.push(
      `\`${filter.column}\` ${filter.op === "eq" ? "=" : "!="} ?`,
    );
    values.push(filter.value);
  }

  return {
    clause: ` WHERE ${parts.join(" AND ")}`,
    values,
  };
}

async function ensureSchema() {
  schemaReady ??= (async () => {
    if (!databaseUrl) {
      const bootstrapPool = mysql.createPool({
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        waitForConnections: true,
        connectionLimit: 1,
      });

      await bootstrapPool.query(
        `CREATE DATABASE IF NOT EXISTS \`${mysqlDatabase}\``,
      );
      await bootstrapPool.end();
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(191) PRIMARY KEY,
        user_id VARCHAR(191) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        days INT NOT NULL,
        budget DECIMAL(12,2) NOT NULL,
        plan JSON NULL,
        invite_code VARCHAR(191) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trip_members (
        id VARCHAR(191) PRIMARY KEY,
        trip_id VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NOT NULL,
        user_name VARCHAR(255) NULL,
        role VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_trip_user (trip_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(191) PRIMARY KEY,
        trip_id VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NULL,
        title VARCHAR(255) NULL,
        description TEXT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        category VARCHAR(100) NULL,
        paid_by VARCHAR(191) NULL,
        paid_by_name VARCHAR(255) NULL,
        split_count INT NULL,
        split_with JSON NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expense_splits (
        id VARCHAR(191) PRIMARY KEY,
        expense_id VARCHAR(191) NOT NULL,
        trip_id VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NOT NULL,
        user_name VARCHAR(255) NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        settled TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settlements (
        id VARCHAR(191) PRIMARY KEY,
        trip_id VARCHAR(191) NOT NULL,
        from_user_id VARCHAR(191) NULL,
        to_user_id VARCHAR(191) NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS buddy_profiles (
        id VARCHAR(191) PRIMARY KEY,
        user_id VARCHAR(191) NOT NULL,
        name VARCHAR(255) NOT NULL,
        age INT NULL,
        city VARCHAR(255) NULL,
        bio TEXT NULL,
        interests JSON NULL,
        avatar_initials VARCHAR(10) NULL,
        gradient VARCHAR(255) NULL,
        is_verified TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_buddies (
        id VARCHAR(191) PRIMARY KEY,
        saver_user_id VARCHAR(191) NOT NULL,
        saved_user_id VARCHAR(191) NOT NULL,
        saved_user_name VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_saved_buddy (saver_user_id, saved_user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(191) PRIMARY KEY,
        sender_id VARCHAR(191) NOT NULL,
        receiver_id VARCHAR(191) NOT NULL,
        content TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS trip_buddies (
        id VARCHAR(191) PRIMARY KEY,
        trip_id VARCHAR(191) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(191) PRIMARY KEY,
        user_id VARCHAR(191) NOT NULL,
        trip_id VARCHAR(191) NOT NULL,
        razorpay_order_id VARCHAR(191) NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        currency VARCHAR(20) NULL,
        status VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(191) PRIMARY KEY,
        user_id VARCHAR(191) NOT NULL,
        trip_id VARCHAR(191) NOT NULL,
        order_id VARCHAR(191) NULL,
        razorpay_payment_id VARCHAR(191) NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  })();

  await schemaReady;
}

async function enrichRows(table: string, rows: Record<string, unknown>[]) {
  if (table !== "saved_buddies" || !rows.length) {
    return rows;
  }

  const ids = [
    ...new Set(rows.map((row) => row.saved_user_id).filter(Boolean)),
  ];

  if (!ids.length) {
    return rows;
  }

  const [profiles] = await pool.query(
    `SELECT * FROM buddy_profiles WHERE user_id IN (${ids
      .map(() => "?")
      .join(", ")})`,
    ids,
  );

  const profileMap = new Map(
    (profiles as Record<string, unknown>[]).map((profile) => [
      profile.user_id,
      parseRow(profile),
    ]),
  );

  return rows.map((row) => ({
    ...row,
    buddy_profiles: profileMap.get(row.saved_user_id) ?? null,
  }));
}

export async function runDbOperation(operation: DbOperation) {
  await ensureSchema();
  assertTable(operation.table);

  if (operation.action === "select") {
    const where = buildWhere(operation.filters);
    const order = operation.orderBy
      ? ` ORDER BY \`${operation.orderBy.column}\` ${
          operation.orderBy.ascending ? "ASC" : "DESC"
        }`
      : "";
    const limit = operation.limit ? ` LIMIT ${Number(operation.limit)}` : "";
    const [result] = await pool.query(
      `SELECT * FROM \`${operation.table}\`${where.clause}${order}${limit}`,
      where.values,
    );

    const rows = await enrichRows(
      operation.table,
      (result as Record<string, unknown>[]).map(parseRow),
    );

    return {
      data: operation.single ? rows[0] ?? null : rows,
      error: null,
    };
  }

  if (operation.action === "insert") {
    const rawRows = Array.isArray(operation.payload)
      ? operation.payload
      : [operation.payload];
    const insertedRows = rawRows.map((raw) => {
      const row = {
        ...(raw as Record<string, unknown>),
      };

      row.id ??= crypto.randomUUID();
      row.created_at ??= new Date().toISOString().slice(0, 19).replace("T", " ");

      return row;
    });

    for (const row of insertedRows) {
      const keys = Object.keys(row);
      const values = keys.map((key) => normalizeValue(key, row[key]));

      await pool.query(
        `INSERT INTO \`${operation.table}\` (${keys
          .map((key) => `\`${key}\``)
          .join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        values,
      );
    }

    const parsedRows = insertedRows.map(parseRow);

    return {
      data: operation.single ? parsedRows[0] ?? null : parsedRows,
      error: null,
    };
  }

  if (operation.action === "update") {
    const payload = operation.payload as Record<string, unknown>;
    const keys = Object.keys(payload);
    const values = keys.map((key) => normalizeValue(key, payload[key]));
    const where = buildWhere(operation.filters);

    await pool.query(
      `UPDATE \`${operation.table}\` SET ${keys
        .map((key) => `\`${key}\` = ?`)
        .join(", ")}${where.clause}`,
      [...values, ...where.values],
    );

    return runDbOperation({
      ...operation,
      action: "select",
    });
  }

  const where = buildWhere(operation.filters);
  await pool.query(
    `DELETE FROM \`${operation.table}\`${where.clause}`,
    where.values,
  );

  return {
    data: null,
    error: null,
  };
}
