export interface BreadcrumbPathNode {
  path: string
  name: string
  disabled?: boolean
  subMenuList?: BreadcrumbPathNode[]
  subMenu?: BreadcrumbPathNode[]
}

const BREADCRUMB_PATHS: BreadcrumbPathNode[] = [
  {
    path: "/",
    name: "Dashboard",
  },

  {
    path: "/master-data",
    name: "Master Data",
    disabled: true,
    subMenuList: [
      {
        path: "/master-data/chart-of-accounts",
        name: "Master Chart of Accounts",
        subMenu: [
          { path: "/master-data/chart-of-accounts/create", name: "Tambah" },
          { path: "/master-data/chart-of-accounts/:id/detail", name: "Detail" },
          { path: "/master-data/chart-of-accounts/:id/edit", name: "Edit" },
        ],
      },
      {
        path: "/master-data/general-ledger",
        name: "Master General Ledger",
        subMenu: [
          { path: "/master-data/general-ledger/create", name: "Tambah" },
          { path: "/master-data/general-ledger/:id/detail", name: "Detail" },
          { path: "/master-data/general-ledger/:id/edit", name: "Edit" },
        ],
      },
      {
        path: "/master-data/sub-ledger",
        name: "Master Sub Ledger",
        subMenu: [
          { path: "/master-data/sub-ledger/create", name: "Tambah" },
          { path: "/master-data/sub-ledger/:id/detail", name: "Detail" },
          { path: "/master-data/sub-ledger/:id/edit", name: "Edit" },
        ],
      },
    ],
  },

  {
    path: "/special-journal",
    name: "Special Journal",
    disabled: true,
    subMenuList: [
      {
        path: "/special-journal/cash-disbursement",
        name: "Buku Kas Keluar",
        subMenu: [
          { path: "/special-journal/cash-disbursement/create", name: "Tambah" },
          { path: "/special-journal/cash-disbursement/:id/detail", name: "Detail" },
          { path: "/special-journal/cash-disbursement/:id/edit", name: "Edit" },
          { path: "/special-journal/cash-disbursement/print", name: "Cetak" },
        ],
      },
      {
        path: "/special-journal/cash-receipt",
        name: "Buku Kas Masuk",
        subMenu: [
          { path: "/special-journal/cash-receipt/create", name: "Tambah" },
          { path: "/special-journal/cash-receipt/:id/detail", name: "Detail" },
          { path: "/special-journal/cash-receipt/:id/edit", name: "Edit" },
          { path: "/special-journal/cash-receipt/print", name: "Cetak" },
        ],
      },
      {
        path: "/special-journal/sales",
        name: "Buku Penjualan",
        subMenu: [
          { path: "/special-journal/sales/create", name: "Tambah" },
          { path: "/special-journal/sales/:id/detail", name: "Detail" },
          { path: "/special-journal/sales/:id/edit", name: "Edit" },
          { path: "/special-journal/sales/print", name: "Cetak" },
        ],
      },
      {
        path: "/special-journal/purchase",
        name: "Buku Pembelian",
        subMenu: [
          { path: "/special-journal/purchase/create", name: "Tambah" },
          { path: "/special-journal/purchase/:id/detail", name: "Detail" },
          { path: "/special-journal/purchase/:id/edit", name: "Edit" },
          { path: "/special-journal/purchase/print", name: "Cetak" },
        ],
      },
      {
        path: "/special-journal/usage",
        name: "Jurnal Pemakaian",
        subMenu: [
          { path: "/special-journal/usage/create", name: "Tambah" },
          { path: "/special-journal/usage/:id/detail", name: "Detail" },
          { path: "/special-journal/usage/:id/edit", name: "Edit" },
          { path: "/special-journal/usage/print", name: "Cetak" },
        ],
      },
    ],
  },

  {
    path: "/reports",
    name: "Laporan",
    disabled: true,
    subMenuList: [
      {
        path: "/reports/unadjusted-trial-balance",
        name: "Neraca Lajur (Unadjusted)",
        subMenu: [
          { path: "/reports/unadjusted-trial-balance/:id/detail", name: "Detail" },
          { path: "/reports/unadjusted-trial-balance/print", name: "Cetak" },
        ],
      },
      {
        path: "/reports/adjusted-trial-balance",
        name: "Neraca Lajur (Adjusted)",
        subMenu: [
          { path: "/reports/adjusted-trial-balance/:id/detail", name: "Detail" },
          { path: "/reports/adjusted-trial-balance/print", name: "Cetak" },
        ],
      },
      {
        path: "/reports/income-statement",
        name: "Laporan Laba/Rugi",
        subMenu: [
          { path: "/reports/income-statement/print", name: "Cetak" },
        ],
      },
      {
        path: "/reports/balance-sheet",
        name: "Laporan Neraca",
        subMenu: [
          { path: "/reports/balance-sheet/print", name: "Cetak" },
        ],
      },
    ],
  },

  {
    path: "/nota-adjustment",
    name: "Nota & Adjustment",
    disabled: true,
    subMenuList: [
      {
        path: "/nota-adjustment/debit-note",
        name: "Debit Nota",
        subMenu: [
          { path: "/nota-adjustment/debit-note/create", name: "Tambah" },
          { path: "/nota-adjustment/debit-note/:id/detail", name: "Detail" },
          { path: "/nota-adjustment/debit-note/:id/edit", name: "Edit" },
        ],
      },
      {
        path: "/nota-adjustment/credit-note",
        name: "Credit Nota",
        subMenu: [
          { path: "/nota-adjustment/credit-note/create", name: "Tambah" },
          { path: "/nota-adjustment/credit-note/:id/detail", name: "Detail" },
          { path: "/nota-adjustment/credit-note/:id/edit", name: "Edit" },
        ],
      },
      {
        path: "/nota-adjustment/memo",
        name: "Memo",
        subMenu: [
          { path: "/nota-adjustment/memo/create", name: "Tambah" },
          { path: "/nota-adjustment/memo/:id/detail", name: "Detail" },
          { path: "/nota-adjustment/memo/:id/edit", name: "Edit" },
        ],
      },
      {
        path: "/nota-adjustment/adjustment",
        name: "Adjustment",
        subMenu: [
          { path: "/nota-adjustment/adjustment/create", name: "Tambah" },
          { path: "/nota-adjustment/adjustment/:id/detail", name: "Detail" },
          { path: "/nota-adjustment/adjustment/:id/edit", name: "Edit" },
        ],
      },
    ],
  },
]

export default BREADCRUMB_PATHS