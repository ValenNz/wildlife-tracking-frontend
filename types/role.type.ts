export type TYPE_PERMISSION = {
  permission_id: number;
  name_permission: string;
  description: string | null;
};

export type TYPE_ROLE = {
  role_id: number;
  name_role: string;
  description: string | null;
  users_count?: number;
  permissions: TYPE_PERMISSION[];
};

export type TYPE_ROLE_PAYLOAD = {
  name_role: string;
  description?: string | null;
};

/** Role bawaan dipakai backend untuk target notifikasi: tidak bisa diganti nama atau dihapus. */
export const BUILT_IN_ROLES = [
  "konservasionis_lapangan",
  "peneliti_ekologi",
  "administrator_sistem",
  "pengambil_kebijakan",
];
