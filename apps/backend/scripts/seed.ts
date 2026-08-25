import { pool } from "../src/db.js";
import { hashPassword } from "../src/password.js";

const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required.");
}

try {
  const hash = hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users(email, display_name, password_hash, is_superadmin)
     VALUES ($1, 'Platform SuperAdmin', $2, true)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   is_superadmin = true,
                   status = 'ACTIVE',
                   updated_at = now()
     RETURNING id, email, is_superadmin`,
    [email, hash],
  );
  console.log("[seed] superadmin", result.rows[0]);
} finally {
  await pool.end();
}
