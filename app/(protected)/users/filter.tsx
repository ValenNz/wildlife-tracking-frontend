import type { FilterField, FilterValues } from "@/components/filter";
import type { TYPE_ROLE } from "@/types/role.type";

export type UserFilterValues = FilterValues & {
  search: string;
  role_id: string;
  status: string;
};

export const USER_INITIAL_FILTERS: UserFilterValues = {
  search: "",
  role_id: "all",
  status: "all",
};

export const getUserFilterFields = (roles: TYPE_ROLE[]): FilterField[] => [
  {
    key: "search",
    kind: "search",
    label: "Cari Pengguna",
    placeholder: "Cari nama, username, atau email...",
  },
  {
    key: "role_id",
    kind: "select",
    label: "Role",
    options: [
      { label: "Semua Role", value: "all" },
      ...roles.map((role) => ({ label: role.name_role, value: String(role.role_id) })),
    ],
  },
  {
    key: "status",
    kind: "select",
    label: "Status",
    options: [
      { label: "Semua Status", value: "all" },
      { label: "Aktif", value: "aktif" },
      { label: "Nonaktif", value: "nonaktif" },
    ],
  },
];
