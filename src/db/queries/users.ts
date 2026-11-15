import { DomainError } from '../../errors';
import { hashPassword } from '../../security/password';
import { db } from '../index';

export type User = {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  job_role:
    | 'duty_doctor'
    | 'consultant'
    | 'staff_nurse'
    | 'pharmacist'
    | 'billing_insurance'
    | 'bed_desk'
    | 'administrator';
  registration_number: string | null;
  specialization: string | null;
  phone: string | null;
  email?: string | null;
  current_area: string | null;
  last_seen_at: Date | null;
  created_at: Date;
  disabled_at: Date | null;
  app_access_enabled: boolean;
};

export type DoctorPresence = User & { online: boolean };

export async function createUser(data: {
  name: string;
  role: User['role'];
  job_role?: User['job_role'];
  registration_number?: string;
  specialization?: string;
  phone?: string;
  email?: string;
  password?: string;
}): Promise<User> {
  if (Boolean(data.email) !== Boolean(data.password)) throw new Error('email and password must be provided together');
  const passwordHash = data.password ? await hashPassword(data.password) : null;
  try {
    return await db.begin(async (tx) => {
      const [row] = await tx<User[]>`
        INSERT INTO staff.users (name, role, job_role, registration_number, specialization, phone)
        VALUES (
          ${data.name}, ${data.role},
          ${data.job_role ?? (data.role === 'doctor' ? 'duty_doctor' : data.role === 'nurse' ? 'staff_nurse' : 'administrator')},
          ${data.registration_number ?? null}, ${data.specialization ?? null}, ${data.phone ?? null}
        ) RETURNING *
      `;
      if (passwordHash) await tx`
        INSERT INTO staff.user_credentials (user_id, email, password_hash)
        VALUES (${row.id}, ${data.email!}, ${passwordHash})
      `;
      return { ...row, email: data.email ?? null };
    });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') throw new DomainError('conflict');
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const [row] = await db<User[]>`
    SELECT u.*, c.email FROM staff.users u LEFT JOIN staff.user_credentials c ON c.user_id = u.id WHERE u.id = ${id}
  `;
  return row ?? null;
}

export function listUsers(role?: User['role']): Promise<User[]> {
  if (role) {
    return db<User[]>`
      SELECT u.*, c.email FROM staff.users u LEFT JOIN staff.user_credentials c ON c.user_id = u.id
      WHERE u.role = ${role} AND u.disabled_at IS NULL
      ORDER BY u.name
    `;
  }
  return db<User[]>`
    SELECT u.*, c.email FROM staff.users u LEFT JOIN staff.user_credentials c ON c.user_id = u.id
    WHERE u.disabled_at IS NULL ORDER BY u.name
  `;
}

export async function setUserAppAccess(id: string, enabled: boolean, actorId: string): Promise<{ name: string; changed: boolean } | 'not_found' | 'last_admin'> {
  return db.begin(async (tx) => {
    // Serialize administrator access changes so concurrent requests cannot lock out all admins.
    await tx`SELECT pg_advisory_xact_lock(65820401)`;
    const [user] = await tx<User[]>`SELECT * FROM staff.users WHERE id = ${id} AND disabled_at IS NULL FOR UPDATE`;
    if (!user) return 'not_found';
    if (!enabled && user.app_access_enabled && user.job_role === 'administrator') {
      const [count] = await tx<{ count: number }[]>`
        SELECT count(*)::int AS count FROM staff.users
        WHERE job_role = 'administrator' AND disabled_at IS NULL AND app_access_enabled
      `;
      if (count.count <= 1) return 'last_admin';
    }
    if (user.app_access_enabled !== enabled) {
      await tx`UPDATE staff.users SET app_access_enabled = ${enabled} WHERE id = ${id}`;
      await tx`INSERT INTO clinical.audit_log (actor_user_id, action, record_table, record_id, before, after)
        VALUES (${actorId}, 'set_app_access', 'staff.users', ${id},
          ${tx.json({ app_access_enabled: user.app_access_enabled })}, ${tx.json({ app_access_enabled: enabled })})`;
    }
    return { name: user.name, changed: user.app_access_enabled !== enabled };
  });
}

export async function disableUser(id: string): Promise<void> {
  await db`UPDATE staff.users SET disabled_at = now() WHERE id = ${id}`;
}

export function touchLastSeen(id: string): void {
  db`UPDATE staff.users SET last_seen_at = now() WHERE id = ${id}`.catch(() => {});
}

export async function setDoctorArea(id: string, area: string | null): Promise<User | null> {
  const [row] = await db<User[]>`
    UPDATE staff.users SET current_area = ${area}
    WHERE id = ${id} AND role = 'doctor' AND disabled_at IS NULL
    RETURNING *
  `;
  return row ?? null;
}

export async function listActiveDoctors(): Promise<DoctorPresence[]> {
  const rows = await db<(User & { online: boolean })[]>`
    SELECT *,
      (last_seen_at > now() - interval '5 minutes') AS online
    FROM staff.users
    WHERE role = 'doctor' AND disabled_at IS NULL AND current_area IS NOT NULL
    ORDER BY name
  `;
  return rows;
}
