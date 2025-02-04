"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Toaster } from "@/components/ui/toaster"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Check,
  Calendar,
  Users,
  Rows,
  Loader2,
  Trash2,
  RefreshCw,
  FileX,
} from "lucide-react"
import {
  getFineDocuments,
  getTotalUniqueEvents,
  deleteFines,
  updateAttendance,
  type FineDocument,
  type FineDocumentData,
  createFineDocument,
} from "@/lib/GeneralAttendance/GeneralAttendance"
import { Checkbox } from "@/components/ui/checkbox"

export default function SupplyFinesManagement() {
  const [fines, setFines] = useState<FineDocument[]>([])
  const [totalEvents, setTotalEvents] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFineId, setSelectedFineId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const [isUpdatingFines, setIsUpdatingFines] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [isLoadingFines, setIsLoadingFines] = useState(false)
  const [eventNames, setEventNames] = useState<string[]>([])

  const [hasDocuments, setHasDocuments] = useState(false)
  const [selectedFines, setSelectedFines] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const finesData = await getFineDocuments()
      setFines(finesData)
      setHasDocuments(finesData.length > 0)

      const totalEventsCount = await getTotalUniqueEvents()
      setTotalEvents(totalEventsCount)

      // Get unique event names
      const uniqueEventNames = [...new Set(finesData.map((f) => f.eventName))]
      setEventNames(uniqueEventNames)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdateFines = async () => {
    setIsUpdatingFines(true)
    setIsLoadingFines(true)
    try {
      await updateAttendance()

      toast({
        title: "Fines Update Complete",
        description:
          "All existing fines have been deleted and new fines have been created based on the latest attendance data.",
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })

      // Fetch updated fines data
      const updatedFinesData = await getFineDocuments()
      setFines(updatedFinesData)
      setHasDocuments(updatedFinesData.length > 0)
    } catch (error) {
      console.error("Error updating fines:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update fines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingFines(false)
      setIsLoadingFines(false)
      setUpdateDialogOpen(false)
    }
  }

  const handleSubmitSupplies = async (id: string) => {
    try {
      const fineToUpdate = fines.find((fine) => fine.$id === id)
      if (!fineToUpdate) return

      const updatedFineData: FineDocumentData = {
        userId: fineToUpdate.userId,
        studentId: fineToUpdate.studentId,
        name: fineToUpdate.name,
        absences: fineToUpdate.absences,
        presences: fineToUpdate.presences,
        penalties: fineToUpdate.penalties,
        dateIssued: fineToUpdate.dateIssued,
        status: "penaltyCleared",
      }

      const updatedFineDocument = await createFineDocument(updatedFineData)
      setFines((prev) => prev.map((fine) => (fine.$id === id ? updatedFineDocument : fine)))
      toast({
        title: "Success",
        description: "Fine has been marked as cleared.",
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })
    } catch (error) {
      console.error("Error updating fine document:", error)
      toast({
        title: "Error",
        description: "Failed to update fine status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFines = async () => {
    setIsDeleting(true)
    try {
      for (const id of selectedFines) {
        await deleteFines(id)
      }
      setFines((prevFines) => prevFines.filter((fine) => !selectedFines.includes(fine.$id)))
      setSelectedFines([])
      setSelectAll(false) // Add this line to uncheck the "select all" checkbox
      toast({
        title: "Success",
        description: `Successfully deleted ${selectedFines.length} fine(s).`,
        variant: "success",
        className: "border-blue-500 text-blue-700 bg-blue-50",
      })
      setHasDocuments(fines.length > selectedFines.length)
    } catch (error) {
      console.error("Error deleting fines:", error)
      toast({
        title: "Error",
        description: "Failed to delete fines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const filteredFines = fines.filter((fine) =>
    Object.values(fine).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredFines.length / rowsPerPage)
  const paginatedFines = filteredFines.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setSelectedFines(checked ? paginatedFines.map((fine) => fine.$id) : [])
  }

  useEffect(() => {
    if (fines.length === 0) {
      setSelectAll(false)
    }
  }, [fines])

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Attendance Penalties Management</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold mb-2">Total required events: {totalEvents}</p>
            <div className="max-h-40 overflow-y-auto">
              <ul className="list-disc list-inside">
                {eventNames.map((eventName, index) => (
                  <li key={index} className="text-sm">
                    {eventName}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2" />
              Search and Rows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search all fields"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Select
              onValueChange={(value) => setRowsPerPage(Number.parseInt(value))}
              defaultValue={rowsPerPage.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4 mb-4">
        <AlertDialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button disabled={isUpdatingFines}>
              {isUpdatingFines ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Fines
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Fines Update</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to update fines? This will delete all existing fines and create new ones based on
                the latest attendance data. This process may take several minutes, depending on the number of documents.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUpdateDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleUpdateFines()
                  setUpdateDialogOpen(false)
                }}
                disabled={isUpdatingFines}
              >
                {isUpdatingFines ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-4">
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={selectedFines.length === 0 || isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedFines.length})
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedFines.length} selected fine(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFines} disabled={isDeleting}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Rows className="w-6 h-6 mr-2" />
            Required Supplies List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading fines data...</span>
            </div>
          ) : isLoadingFines ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading updated fines...</span>
            </div>
          ) : !hasDocuments ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileX className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-xl font-semibold mb-2">No Results</p>
              <p className="text-gray-500">
                No fines have been updated yet. Click the &quot;Update Fines&quot; button to generate new fines based on
                the latest attendance data.
              </p>
            </div>
          ) : (
            <>
              {/* Table view for large devices */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Presences</TableHead>
                      <TableHead>Absences</TableHead>
                      <TableHead>Required Supplies</TableHead>
                      <TableHead>Date Issued</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFines.map((fine) => (
                      <TableRow key={fine.$id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFines.includes(fine.$id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFines([...selectedFines, fine.$id])
                              } else {
                                setSelectedFines(selectedFines.filter((id) => id !== fine.$id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{fine.studentId}</TableCell>
                        <TableCell>{fine.name}</TableCell>
                        <TableCell>{fine.presences}</TableCell>
                        <TableCell>{fine.absences}</TableCell>
                        <TableCell>{fine.penalties}</TableCell>
                        <TableCell>{fine.dateIssued}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              fine.status === "Cleared" || fine.status === "penaltyCleared" ? "secondary" : "outline"
                            }
                            className={
                              fine.status === "Cleared" || fine.status === "penaltyCleared"
                                ? "bg-green-500 text-white"
                                : ""
                            }
                          >
                            {fine.status === "penaltyCleared" ? "Cleared" : fine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {fine.status === "Pending" ? (
                            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button onClick={() => setSelectedFineId(fine.$id)} size="sm">
                                  Mark as Cleared
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to mark this fine as cleared?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (selectedFineId) {
                                        handleSubmitSupplies(selectedFineId)
                                        setDialogOpen(false)
                                      }
                                    }}
                                  >
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              <Check className="w-4 h-4 mr-1" />
                              Cleared
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Card view for small devices */}
              <div className="md:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    <span className="mr-2 ">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                    </span>
                    Select All
                  </span>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {paginatedFines.map((fine) => (
                    <Card key={fine.$id} className="p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="col-span-2 flex items-center justify-between mb-2">
                          <Checkbox
                            checked={selectedFines.includes(fine.$id)}
                            onCheckedChange={(checked) => {
                              setSelectedFines((prev) =>
                                checked ? [...prev, fine.$id] : prev.filter((id) => id !== fine.$id),
                              )
                            }}
                          />
                          <Badge
                            variant={
                              fine.status === "Cleared" || fine.status === "penaltyCleared" ? "secondary" : "outline"
                            }
                            className={`text-xs ${
                              fine.status === "Cleared" || fine.status === "penaltyCleared"
                                ? "bg-green-500 text-white"
                                : ""
                            }`}
                          >
                            {fine.status === "penaltyCleared" ? "Cleared" : fine.status}
                          </Badge>
                        </div>
                        {[
                          { label: "Student ID", value: fine.studentId },
                          { label: "Name", value: fine.name },
                          { label: "Presences", value: fine.presences },
                          { label: "Absences", value: fine.absences },
                          { label: "Required Supplies", value: fine.penalties },
                          { label: "Date Issued", value: fine.dateIssued },
                        ].map(({ label, value }) => (
                          <div key={label} className="col-span-2 flex flex-col">
                            <p className="font-semibold text-xs">{label}:</p>
                            <p className="text-sm truncate">{value}</p>
                          </div>
                        ))}
                        <div className="col-span-2 mt-2">
                          {fine.status === "Pending" ? (
                            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  onClick={() => setSelectedFineId(fine.$id)}
                                  size="sm"
                                  className="w-full text-xs"
                                >
                                  Mark as Cleared
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to mark this fine as cleared?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (selectedFineId) {
                                        handleSubmitSupplies(selectedFineId)
                                        setDialogOpen(false)
                                      }
                                    }}
                                  >
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Badge variant="outline" className="text-green-600 w-full justify-center text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Cleared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left w-full sm:w-auto">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredFines.length)} of {filteredFines.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 sm:p-2"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 sm:p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 sm:p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 sm:p-2"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <footer className="py-4 text-center">
          <p className="text-sm">JESUS BE ALL THE GLORY!</p>
          <p className="text-xs mt-1">© SSG QR Attendance</p>
        </footer>
      </Card>
      <Toaster />
    </div>
  )
}

