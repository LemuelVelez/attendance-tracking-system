"use client"

import * as React from "react"
import {
  ChevronDown,
  ArrowUpDown,
  Search,
  Trash2,
  Plus,
  Columns,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
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
import { getGeneralAttendance, deleteGeneralAttendance } from "@/lib/GeneralAttendance/GeneralAttendance"
import {
  createCTEAttendance,
  createCOEAttendance,
  createCCJEAttendance,
  createCBAAttendance,
  createCASAttendance,
  createCAFAttendance,
  createCCSAttendance,
  createJRMSUTCOrganizationsAttendance,
} from "@/lib/attendance/college"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export type Attendance = {
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

const collegeOptions = [
  {
    value: "CTE_ATTENDANCE_COLLECTION_ID",
    label: "College of Teacher Education",
  },
  { value: "COE_ATTENDANCE_COLLECTION_ID", label: "College of Engineering" },
  {
    value: "CCJE_ATTENDANCE_COLLECTION_ID",
    label: "College of Criminal Justice Education",
  },
  {
    value: "CBA_ATTENDANCE_COLLECTION_ID",
    label: "College of Business Administration",
  },
  {
    value: "CAS_ATTENDANCE_COLLECTION_ID",
    label: "College of Arts and Sciences",
  },
  {
    value: "CAF_ATTENDANCE_COLLECTION_ID",
    label: "College of Agriculture and Forestry",
  },
  {
    value: "CCS_ATTENDANCE_COLLECTION_ID",
    label: "College of Computing Studies",
  },
  {
    value: "JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID",
    label: "JRMSU TC Organizations",
  },
]

const EntriesInfo: React.FC<{ start: number; end: number; total: number }> = ({ start, end, total }) => {
  return (
    <div className="text-sm text-muted-foreground">
      Showing {start} to {end} of {total} entries
    </div>
  )
}

export function GeneralAttendanceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [data, setData] = React.useState<Attendance[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCollege, setSelectedCollege] = React.useState<string | null>(null)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const { toast } = useToast()
  const [isCreatingAttendance, setIsCreatingAttendance] = React.useState(false)
  const [isDeletingAttendance, setIsDeletingAttendance] = React.useState(false)

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
        setIsLoadingData(true)
        const attendanceData = await getGeneralAttendance()
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
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

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
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: itemsPerPage,
      },
    },
  })

  const handleCreateCollegeAttendance = async () => {
    if (!selectedCollege) {
      toast({
        title: "Error",
        description: "Please select a college before creating attendance.",
        variant: "destructive",
      })
      return
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one row before creating attendance.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingAttendance(true)

    try {
      let createdCount = 0
      let existingCount = 0

      for (const row of selectedRows) {
        const attendanceData = row.original
        const eventData = {
          eventName: attendanceData.eventName,
          location: attendanceData.location,
          date: attendanceData.date,
          day: attendanceData.day,
          time: attendanceData.time,
        }
        const userData = {
          userId: attendanceData.userId,
          studentId: attendanceData.studentId,
          name: attendanceData.name,
          degreeProgram: attendanceData.degreeProgram,
          yearLevel: attendanceData.yearLevel,
          section: attendanceData.section,
        }

        let result
        switch (selectedCollege) {
          case "CTE_ATTENDANCE_COLLECTION_ID":
            result = await createCTEAttendance(eventData, userData)
            break
          case "COE_ATTENDANCE_COLLECTION_ID":
            result = await createCOEAttendance(eventData, userData)
            break
          case "CCJE_ATTENDANCE_COLLECTION_ID":
            result = await createCCJEAttendance(eventData, userData)
            break
          case "CBA_ATTENDANCE_COLLECTION_ID":
            result = await createCBAAttendance(eventData, userData)
            break
          case "CAS_ATTENDANCE_COLLECTION_ID":
            result = await createCASAttendance(eventData, userData)
            break
          case "CAF_ATTENDANCE_COLLECTION_ID":
            result = await createCAFAttendance(eventData, userData)
            break
          case "CCS_ATTENDANCE_COLLECTION_ID":
            result = await createCCSAttendance(eventData, userData)
            break
          case "JRMSU_TC_ORGANIZATIONS_ATTENDANCE_COLLECTION_ID":
            result = await createJRMSUTCOrganizationsAttendance(eventData, userData)
            break
          default:
            throw new Error("Invalid college selected")
        }

        if (result === null) {
          existingCount++
        } else {
          createdCount++
        }
      }

      if (createdCount > 0) {
        toast({
          title: "Success",
          description: `Created ${createdCount} new attendance record(s). ${existingCount} record(s) were already recorded for the same user and event, and were skipped.`,
          variant: "success",
        })
      } else {
        toast({
          title: "Info",
          description: `All ${existingCount} selected record(s) were already recorded for the same user and event. No new records were created.`,
          variant: "info",
        })
      }
    } catch (error) {
      console.error("Error creating college attendance:", error)
      toast({
        title: "Error",
        description: "Failed to create college attendance records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAttendance(false)
    }
  }

  const handleDeleteAllAttendance = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one row to delete.",
        variant: "destructive",
      })
      return
    }

    setIsDeletingAttendance(true)

    try {
      for (const row of selectedRows) {
        await deleteGeneralAttendance(row.original.$id)
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
      setIsDeletingAttendance(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 md:p-8">
        
      <Card className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
      <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-center w-full mb-2 mt-4 ">
              <Button variant="outline" className="w-auto bg-primary text-white">
                View General Attendance Instructions
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[350px] lg:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-lg lg:xl">General Attendance Management Instructions</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh] w-full rounded-md border p-4">
              <div className="text-sm lg:text-lg space-y-4">
                <h3 className="text-lg font-semibold">
                  General Attendance Overview:
                </h3>
                <p>
                  General Attendance displays all recorded attendance in a table for the
                  entire student body. Use the select options to filter by colleges or JRMSU-TC
                  organizations. Follow the steps below to manage and transfer attendance
                  records appropriately:
                </p>

                <h3 className="text-lg font-semibold">
                  Attendance Management Process:
                </h3>
                <p>
                  If attendance is recorded for specific colleges or organizations:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Utilize the search bar to efficiently find attendance records by typing relevant values,
                    such as event name (for example, &quot;Flag Ceremony&quot;), student name (for example, &quot;John Doe&quot;), or student ID
                    (for example, &quot;TC-21-A-00123&quot;) to display related results.
                  </li>
                  <li>
                    Transfer the recorded attendance from General Attendance to the respective
                    college or organization.
                  </li>
                  <li>
                    Locate the attendance entry in General Attendance that corresponds to the
                    college or organization.
                  </li>
                  <li>
                    Assign it to the relevant college or organization using the select options.
                  </li>
                  <li>
                    Delete the corresponding recorded attendance in General
                    Attendance to prevent it from being included in fines
                    management.
                  </li>
                  <li>
                    If there are no entries to transfer, leave the records as they are.
                  </li>
                </ul>

                <p>
                  If the event is for the entire JRMSU-TC student body, no transfer is
                  required. Simply leave the attendance in General Attendance.
                </p>

                <p className="font-semibold mt-4">
                  All recorded attendance can be printed from the Print Attendance section.
                </p>

                <div className="mt-4 space-y-2">    
                  <p>
                    <strong>Segregated Attendance:</strong>{" "}
                    <a
                      href="https://ssg-qr-attendance.vercel.app/admin/segregated-attendance"
                      className="text-blue-500 hover:underline"
                    >
                      https://ssg-qr-attendance.vercel.app/admin/segregated-attendance
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
          <CardTitle className="text-2xl font-bold">General Attendance</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          {error ? (
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
                  <Select onValueChange={setSelectedCollege}>
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
                        variant="outline"
                        className="w-full sm:w-[200px]"
                        disabled={table.getFilteredSelectedRowModel().rows.length === 0 || isCreatingAttendance}
                      >
                        {isCreatingAttendance ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        {isCreatingAttendance ? "Adding..." : "Add College Attendance"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Create College Attendance</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to create attendance records for the selected college?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreateCollegeAttendance}>Create</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-[200px]"
                        disabled={table.getFilteredSelectedRowModel().rows.length === 0 || isDeletingAttendance}
                      >
                        {isDeletingAttendance ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {isDeletingAttendance ? "Deleting..." : "Delete"}
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
                        <AlertDialogAction onClick={handleDeleteAllAttendance}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-[200px]">
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
                <EntriesInfo
                  start={table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                  end={Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}
                  total={table.getFilteredRowModel().rows.length}
                />
                <div className="flex items-center space-x-2">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="w-[95px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="20">20 rows</SelectItem>
                      <SelectItem value="30">30 rows</SelectItem>
                      <SelectItem value="40">40 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
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
                    {isLoadingData ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                          <span className="mt-2 block">Loading data...</span>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
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
                    disabled={!table.getCanPreviousPage() || isLoadingData}
                  >
                    {isLoadingData ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ChevronsLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || isLoadingData}
                  >
                    {isLoadingData ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || isLoadingData}
                  >
                    {isLoadingData ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage() || isLoadingData}
                  >
                    {isLoadingData ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ChevronsRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <footer className="py-4 text-center">
          <p className="text-sm">JESUS BE ALL THE GLORY!</p>
          <p className="text-xs mt-1">© SSG QR Attendance</p>
        </footer>
      </Card>
    </div>
  )
}

