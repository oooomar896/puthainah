export interface TabItem {
  name: string
  href: string
  numbers?: number
  color?: string
}
export interface Column {
  name: string
  width?: string
  selector?: (row: any) => any
  cell?: (row: any, index?: number, column?: any, id?: string | number) => any
  wrap?: boolean
  sortable?: boolean
  ignoreRowClick?: boolean
  allowOverflow?: boolean
  button?: boolean
}
export interface CustomDataTableProps {
  columns: Column[]
  pagination?: boolean
  data: any[]
  title?: string
  searchPlaceholder?: string
  searchableFields?: string[] | false | null
  tabs?: TabItem[]
  totalRows?: number
  defaultPage?: number
  defaultPageSize?: number
  isLoading?: boolean
  allowOverflow?: boolean
  [key: string]: any
}
export default function CustomDataTable(props: CustomDataTableProps): any
