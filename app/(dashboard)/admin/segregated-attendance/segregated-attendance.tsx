"use client"

import * as React from "react"
import {
  ChevronDown,
  ArrowUpDown,
  Search,
  Trash2,
  Columns,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  getTeacherEducationAttendance,
  getEngineeringAttendance,
  getCriminalJusticeEducationAttendance,
  getBusinessAdministrationAttendance,
  getArtsAndSciencesAttendance,
  getAgricultureAndForestryAttendance,
  getComputingStudiesAttendance,
  deleteTeacherEducationAttendance,
  deleteEngineeringAttendance,
  deleteCriminalJusticeEducationAttendance,
  deleteBusinessAdministrationAttendance,
  deleteArtsAndSciencesAttendance,
  deleteAgricultureAndForestryAttendance,
  deleteComputingStudiesAttendance,
  getJRMSUTCOrganizationsAttendance,
  deleteJRMSUTCOrganizationsAttendance,
} from "@/lib/GeneralAttendance/getCollegeAttendance"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export type Attendance = {
  $createdAt: string
  $id: string
  userId: string
  studentId: string
  name: string
  degreeProgram: string
  yearLevel: string
  section: string
  eventName: string
  location: string
  date: string
  day: string
  time: string
  Created: string
}

export type CollegeType = "CTE" | "COE" | "CCJE" | "CBA" | "CAS" | "CAF" | "CCS" | "JRMSU-TC"

const collegeOptions = [
  { value: "CTE", label: "College of Teacher Education" },
  { value: "COE", label: "College of Engineering" },
  { value: "CCJE", label: "College of Criminal Justice Education" },
  { value: "CBA", label: "College of Business Administration" },
  { value: "CAS", label: "College of Arts and Sciences" },
  { value: "CAF", label: "College of Agriculture and Forestry" },
  { value: "CCS", label: "College of Computing Studies" },
  { value: "JRMSU-TC", label: "JRMSU-TC Organizations" },
]

async function fetchCollegeAttendance(college: string): Promise<Attendance[]> {
  switch (college) {
    case "CTE":
      return getTeacherEducationAttendance()
    case "COE":
      return getEngineeringAttendance()
    case "CCJE":
      return getCriminalJusticeEducationAttendance()
    case "CBA":
      return getBusinessAdministrationAttendance()
    case "CAS":
      return getArtsAndSciencesAttendance()
    case "CAF":
      return getAgricultureAndForestryAttendance()
    case "CCS":
      return getComputingStudiesAttendance()
    case "JRMSU-TC":
      return getJRMSUTCOrganizationsAttendance()
    default:
      throw new Error("Invalid college selected")
  }
}

async function deleteCollegeAttendance(college: string, attendanceId: string): Promise<void> {
  switch (college) {
    case "CTE":
      return deleteTeacherEducationAttendance(attendanceId)
    case "COE":
      return deleteEngineeringAttendance(attendanceId)
    case "CCJE":
      return deleteCriminalJusticeEducationAttendance(attendanceId)
    case "CBA":
      return deleteBusinessAdministrationAttendance(attendanceId)
    case "CAS":
      return deleteArtsAndSciencesAttendance(attendanceId)
    case "CAF":
      return deleteAgricultureAndForestryAttendance(attendanceId)
    case "CCS":
      return deleteComputingStudiesAttendance(attendanceId)
    case "JRMSU-TC":
      return deleteJRMSUTCOrganizationsAttendance(attendanceId)
    default:
      throw new Error("Invalid college selected")
  }
}

export function SegregatedAttendanceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [data, setData] = React.useState<Attendance[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCollege, setSelectedCollege] = React.useState<string>(collegeOptions[0].value)
  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDeleting, setIsDeleting] = React.useState(false) // Added delete loading state
  const { toast } = useToast()

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  const columns: ColumnDef<Attendance>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("studentId")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "degreeProgram",
      header: "Degree Program",
      cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("degreeProgram")}</div>,
    },
    {
      accessorKey: "yearLevel",
      header: "Year Level",
      cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("yearLevel")}</div>,
    },
    {
      accessorKey: "section",
      header: "Section",
      cell: ({ row }) => <div className="min-w-[90px]">{row.getValue("section")}</div>,
    },
    {
      accessorKey: "eventName",
      header: "Event Name",
      cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("eventName")}</div>,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("location")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="min-w-[100px]">{row.getValue("date")}</div>,
    },
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ row }) => <div className="min-w-[90px]">{row.getValue("day")}</div>,
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => {
        const time24 = row.getValue("time") as string
        const [hours, minutes] = time24.split(":")
        const hours12 = ((Number.parseInt(hours) + 11) % 12) + 1
        const amPm = Number.parseInt(hours) >= 12 ? "PM" : "AM"
        const time12 = `${hours12}:${minutes} ${amPm}`
        return <div className="min-w-[100px]">{time12}</div>
      },
    },
    {
      accessorKey: "Created",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="min-w-[150px]">{new Date(row.getValue("Created")).toLocaleString()}</div>,
    },
  ]

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const attendanceData = await fetchCollegeAttendance(selectedCollege)
        setData(
          attendanceData.map((record) => ({
            ...record,
            Created: record.Created || record.$createdAt,
          })),
        )
      } catch (err) {
        console.error("Error fetching attendance data:", err)
        setError("Failed to load attendance data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCollege])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  const handleDeleteAttendance = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one row to delete.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      for (const row of selectedRows) {
        await deleteCollegeAttendance(selectedCollege, row.original.$id)
      }
      setData((prevData) => prevData.filter((item) => !selectedRows.some((row) => row.original.$id === item.$id)))
      setRowSelection({})
      toast({
        title: "Success",
        description: `${selectedRows.length} attendance record(s) deleted successfully.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting attendance records:", error)
      toast({
        title: "Error",
        description: "Failed to delete some or all attendance records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 md:p-8 space-y-4">
      <Card className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex justify-center w-full mb-2 mt-4 ">
            <Button variant="outline" className="w-auto bg-primary text-white">
              View Segregated Attendance Instructions
            </Button>
          </div>
        </DialogTrigger>
         <DialogContent className="max-w-[350px] lg:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-lg lg:xl">Segregated Attendance Management Instructions</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh] w-full rounded-md border p-4">
              <div className="text-sm lg:text-lg space-y-4">
                <h3 className="text-lg font-semibold">Segregated Attendance Overview:</h3>
                <p>
                  Segregated Attendance allows you to verify and manage the transfer of recorded attendance
                  from General Attendance to specific colleges or JRMSU-TC organizations. Use the search
                  feature to confirm the transfer of attendance records by typing any value, such as event name
                  (for example, &quot;Flag Ceremony&quot;), student name (for example, &quot;John Doe&quot;), student ID (for example, &quot;TC-21-A-00123&quot;),
                  year level, degree program, or other criteria to display related results.
                </p>

                <h3 className="text-lg font-semibold">Attendance Management Process:</h3>
                <p>
                  To ensure proper management of attendance records:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Check if the recorded attendance has been transferred to the correct college or
                    JRMSU-TC organization.
                  </li>
                  <li>
                    If you cannot locate the attendance in the target category, return to General
                    Attendance to verify if it was mistakenly left untransferred.
                  </li>
                  <li>
                    Utilize the search bar to efficiently find attendance records by typing relevant values,
                    such as event name (for example, &quot;Flag Ceremony&quot;), student name (for example, &quot;John Doe&quot;), or student ID
                    (for example, &quot;TC-21-A-00123&quot;) to display related results.
                  </li>
                </ul>

                <p className="font-semibold mt-4">
                  You can print all segregated attendance records into the Print Attendance section.
                </p>

                <div className="mt-4 space-y-2">
                  <p>
                      <strong>General Attendance:</strong>{" "}
                      <a
                        href="https://ssg-qr-attendance.vercel.app/admin/general-attendance"
                        className="text-blue-500 hover:underline"
                      >
                        https://ssg-qr-attendance.vercel.app/admin/general-attendance
                      </a>
                    </p>
                  <p>
                    <strong>Print Attendance:</strong>{" "}
                    <a
                      href="https://ssg-qr-attendance.vercel.app/admin/print-attendance"
                      className="text-blue-500 hover:underline"
                    >
                      https://ssg-qr-attendance.vercel.app/admin/print-attendance
                    </a>
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
          </Dialog>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Segregated Attendance</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">Loading attendance data...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedCollege}
                    onValueChange={(value) => setSelectedCollege(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Select College" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-[200px]"
                        disabled={table.getFilteredSelectedRowModel().rows.length === 0 || isLoading || isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attendance Records</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the selected attendance records? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAttendance} disabled={isDeleting}>
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-[200px]" disabled={isLoading}>
                        <Columns className="mr-2 h-4 w-4" />
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} entries
                </span>
                <div className="flex items-center justify-end space-x-2">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      const newPageSize = Number(value)
                      setPagination((prev) => ({
                        ...prev,
                        pageSize: newPageSize,
                      }))
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[95px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 100, 1000].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {`${size} rows`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea
                className="rounded-md border"
                style={{
                  height: "calc(100vh - 350px)",
                  maxHeight: "calc(100vh - 350px)",
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="whitespace-nowrap">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="p-2 md:p-4 whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                  selected.
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage() || isLoading}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className=" text-sm text-muted-foreground">
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage() || isLoading}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <footer className="py-4 text-center">
            <p className="text-sm">JESUS BE ALL THE GLORY!</p>
            <p className="text-xs mt-1">© SSG QR Attendance</p>
          </footer>
        </CardContent>
      </Card>
    </div>
  )
}

