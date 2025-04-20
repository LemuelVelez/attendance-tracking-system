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
  Edit,
  Plus,
  Settings,
} from "lucide-react"
import {
  getFineDocuments,
  getTotalUniqueEvents,
  deleteFines,
  updateAttendance,
  type FineDocument,
  type FineDocumentData,
  createFineDocument,
  getPenaltiesMap,
  updatePenaltiesMap,
  updateFineDocument,
  updateTotalEvents,
} from "@/lib/GeneralAttendance/GeneralAttendance"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // New state for editing presences and absences
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFine, setEditingFine] = useState<FineDocument | null>(null)
  const [editedPresences, setEditedPresences] = useState("")
  const [editedAbsences, setEditedAbsences] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // New state for penalties management
  const [penaltiesMap, setPenaltiesMap] = useState<Record<number, string>>({})
  const [penaltiesDialogOpen, setPenaltiesDialogOpen] = useState(false)
  const [newPenaltyKey, setNewPenaltyKey] = useState("")
  const [newPenaltyValue, setNewPenaltyValue] = useState("")
  const [editingPenaltyKey, setEditingPenaltyKey] = useState<number | null>(null)
  const [editingPenaltyValue, setEditingPenaltyValue] = useState("")
  const [isPenaltiesSaving, setIsPenaltiesSaving] = useState(false)

  // New state for editing total events
  const [totalEventsDialogOpen, setTotalEventsDialogOpen] = useState(false)
  const [editedTotalEvents, setEditedTotalEvents] = useState("")
  const [isSavingTotalEvents, setIsSavingTotalEvents] = useState(false)

  // New state for confirmation dialogs
  const [confirmTotalEventsDialog, setConfirmTotalEventsDialog] = useState(false)
  const [confirmPenaltiesDialog, setConfirmPenaltiesDialog] = useState(false)
  const [confirmEditAttendanceDialog, setConfirmEditAttendanceDialog] = useState(false)

  // New state for penalty management confirmation dialogs
  const [confirmAddPenaltyDialog, setConfirmAddPenaltyDialog] = useState(false)
  const [confirmDeletePenaltyDialog, setConfirmDeletePenaltyDialog] = useState(false)
  const [penaltyToDelete, setPenaltyToDelete] = useState<number | null>(null)
  const [confirmEditPenaltyDialog, setConfirmEditPenaltyDialog] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const finesData = await getFineDocuments()
      setFines(finesData)
      setHasDocuments(finesData.length > 0)

      const totalEventsCount = await getTotalUniqueEvents()
      // Fix: Check if totalEventsCount is null or undefined before calling toString()
      setTotalEvents(totalEventsCount || 0)
      setEditedTotalEvents(
        totalEventsCount !== null && totalEventsCount !== undefined ? totalEventsCount.toString() : "0",
      )

      // Get unique event names
      const uniqueEventNames = [...new Set(finesData.map((f) => f.eventName).filter(Boolean))]
      setEventNames(uniqueEventNames)

      // Fetch penalties map
      const penalties = await getPenaltiesMap()
      setPenaltiesMap(penalties)
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
      setSelectAll(false)
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

  // New function to handle editing a fine
  const handleEditFine = (fine: FineDocument) => {
    setEditingFine(fine)
    setEditedPresences(fine.presences)
    setEditedAbsences(fine.absences)
    setEditDialogOpen(true)
  }

  // New function to save edited fine
  const handleSaveEditedFine = async () => {
    if (!editingFine) return

    setIsSaving(true)
    try {
      const absencesNum = Number.parseInt(editedAbsences)
      const penalty = penaltiesMap[absencesNum] || penaltiesMap[10] || "No penalty"

      const updatedFineData: FineDocumentData = {
        userId: editingFine.userId,
        studentId: editingFine.studentId,
        name: editingFine.name,
        absences: editedAbsences,
        presences: editedPresences,
        penalties: penalty,
        dateIssued: editingFine.dateIssued,
        status: penalty === "No penalty" ? "Cleared" : "Pending",
      }

      const updatedFine = await updateFineDocument(editingFine.$id, updatedFineData)

      setFines((prev) => prev.map((fine) => (fine.$id === editingFine.$id ? updatedFine : fine)))

      toast({
        title: "Success",
        description: "Attendance has been updated successfully.",
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })

      setEditDialogOpen(false)
      setConfirmEditAttendanceDialog(false)
    } catch (error) {
      console.error("Error updating fine:", error)
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // New function to save penalties map
  const handleSavePenaltiesMap = async () => {
    setIsPenaltiesSaving(true)
    try {
      await updatePenaltiesMap(penaltiesMap)
      toast({
        title: "Success",
        description: "Penalties map has been updated successfully.",
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })
      setPenaltiesDialogOpen(false)
      setConfirmPenaltiesDialog(false)
    } catch (error) {
      console.error("Error updating penalties map:", error)
      toast({
        title: "Error",
        description: "Failed to update penalties map. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPenaltiesSaving(false)
    }
  }

  // New function to add a penalty
  const handleAddPenalty = () => {
    const key = Number.parseInt(newPenaltyKey)
    if (isNaN(key) || newPenaltyValue.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid number of absences and penalty description.",
        variant: "destructive",
      })
      return
    }

    setPenaltiesMap((prev) => ({
      ...prev,
      [key]: newPenaltyValue,
    }))

    setNewPenaltyKey("")
    setNewPenaltyValue("")

    toast({
      title: "Success",
      description: `Penalty for ${key} absence(s) has been added.`,
      variant: "success",
      className: "border-green-500 text-green-700 bg-green-50",
    })

    setConfirmAddPenaltyDialog(false)
  }

  // New function to delete a penalty
  const handleDeletePenalty = (key: number) => {
    setPenaltiesMap((prev) => {
      const newMap = { ...prev }
      delete newMap[key]
      return newMap
    })

    toast({
      title: "Success",
      description: `Penalty for ${key} absence(s) has been deleted.`,
      variant: "success",
      className: "border-green-500 text-green-700 bg-green-50",
    })

    setConfirmDeletePenaltyDialog(false)
    setPenaltyToDelete(null)
  }

  // New function to start editing a penalty
  const handleStartEditPenalty = (key: number, value: string) => {
    setEditingPenaltyKey(key)
    setEditingPenaltyValue(value)
  }

  // New function to save edited penalty
  const handleSaveEditedPenalty = () => {
    if (editingPenaltyKey === null || editingPenaltyValue.trim() === "") return

    setPenaltiesMap((prev) => ({
      ...prev,
      [editingPenaltyKey]: editingPenaltyValue,
    }))

    toast({
      title: "Success",
      description: `Penalty for ${editingPenaltyKey} absence(s) has been updated.`,
      variant: "success",
      className: "border-green-500 text-green-700 bg-green-50",
    })

    setEditingPenaltyKey(null)
    setEditingPenaltyValue("")
    setConfirmEditPenaltyDialog(false)
  }

  // New function to save edited total events
  const handleSaveTotalEvents = async () => {
    setIsSavingTotalEvents(true)
    try {
      const newTotalEvents = Number.parseInt(editedTotalEvents)
      if (isNaN(newTotalEvents) || newTotalEvents < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid number for total events.",
          variant: "destructive",
        })
        return
      }

      await updateTotalEvents(newTotalEvents.toString())
      setTotalEvents(newTotalEvents)

      toast({
        title: "Success",
        description: "Total required events has been updated successfully.",
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })

      setTotalEventsDialogOpen(false)
      setConfirmTotalEventsDialog(false)
    } catch (error) {
      console.error("Error updating total events:", error)
      toast({
        title: "Error",
        description: "Failed to update total events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingTotalEvents(false)
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <p className="text-xl font-semibold">Total required events: {totalEvents}</p>
                <AlertDialog open={totalEventsDialogOpen} onOpenChange={setTotalEventsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Total Required Events</AlertDialogTitle>
                      <AlertDialogDescription>
                        Update the total number of required events. This will affect how absences are calculated.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalEvents">Total Events</Label>
                        <Input
                          id="totalEvents"
                          type="number"
                          min="0"
                          value={editedTotalEvents}
                          onChange={(e) => setEditedTotalEvents(e.target.value)}
                          placeholder="Enter total events"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setTotalEventsDialogOpen(false)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setConfirmTotalEventsDialog(true)}
                        disabled={isSavingTotalEvents}
                      >
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Confirmation dialog for Total Events */}
                <AlertDialog open={confirmTotalEventsDialog} onOpenChange={setConfirmTotalEventsDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to update the total required events to {editedTotalEvents}? This will
                        affect how absences are calculated for all students.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmTotalEventsDialog(false)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSaveTotalEvents} disabled={isSavingTotalEvents}>
                        {isSavingTotalEvents ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Confirm"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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

      <div className="flex flex-wrap gap-4 mb-4">
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

        {/* Button for managing penalties */}
        <AlertDialog open={penaltiesDialogOpen} onOpenChange={setPenaltiesDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Manage Penalties
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Manage Penalties</AlertDialogTitle>
              <AlertDialogDescription>
                Add, edit, or delete penalties based on the number of absences.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Tabs defaultValue="view" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">View Penalties</TabsTrigger>
                <TabsTrigger value="add">Add New Penalty</TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-12 font-medium text-sm py-2 border-b">
                    <div className="col-span-2">Absences</div>
                    <div className="col-span-8">Penalty</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {Object.entries(penaltiesMap)
                    .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                    .map(([key, value]) => {
                      const numKey = Number.parseInt(key)
                      return (
                        <div key={key} className="grid grid-cols-12 items-center py-2 border-b">
                          <div className="col-span-2">{key}</div>
                          <div className="col-span-8">
                            {editingPenaltyKey === numKey ? (
                              <Textarea
                                value={editingPenaltyValue}
                                onChange={(e) => setEditingPenaltyValue(e.target.value)}
                                className="min-h-[80px]"
                              />
                            ) : (
                              <p className="text-sm">{value}</p>
                            )}
                          </div>
                          <div className="col-span-2 flex space-x-2">
                            {editingPenaltyKey === numKey ? (
                              <Button size="sm" onClick={() => setConfirmEditPenaltyDialog(true)}>
                                Save
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleStartEditPenalty(numKey, value)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setPenaltyToDelete(numKey)
                                setConfirmDeletePenaltyDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>

              <TabsContent value="add" className="mt-4">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="absences">Number of Absences</Label>
                      <Input
                        id="absences"
                        type="number"
                        min="0"
                        value={newPenaltyKey}
                        onChange={(e) => setNewPenaltyKey(e.target.value)}
                        placeholder="Enter number of absences"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penalty">Penalty Description</Label>
                      <Textarea
                        id="penalty"
                        value={newPenaltyValue}
                        onChange={(e) => setNewPenaltyValue(e.target.value)}
                        placeholder="Enter penalty description"
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button onClick={() => setConfirmAddPenaltyDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Penalty
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel onClick={() => setPenaltiesDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setConfirmPenaltiesDialog(true)} disabled={isPenaltiesSaving}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for Penalties */}
        <AlertDialog open={confirmPenaltiesDialog} onOpenChange={setConfirmPenaltiesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Penalties Update</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to save these changes to the penalties? This will affect how penalties are
                assigned to students.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmPenaltiesDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSavePenaltiesMap} disabled={isPenaltiesSaving}>
                {isPenaltiesSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for Adding Penalty */}
        <AlertDialog open={confirmAddPenaltyDialog} onOpenChange={setConfirmAddPenaltyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Add Penalty</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to add a new penalty for {newPenaltyKey} absence(s)?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmAddPenaltyDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddPenalty}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for Deleting Penalty */}
        <AlertDialog open={confirmDeletePenaltyDialog} onOpenChange={setConfirmDeletePenaltyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete Penalty</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the penalty for {penaltyToDelete} absence(s)?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDeletePenaltyDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => penaltyToDelete !== null && handleDeletePenalty(penaltyToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for Editing Penalty */}
        <AlertDialog open={confirmEditPenaltyDialog} onOpenChange={setConfirmEditPenaltyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Edit Penalty</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to update the penalty for {editingPenaltyKey} absence(s)?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmEditPenaltyDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveEditedPenalty}>Confirm</AlertDialogAction>
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

      {/* Dialog for editing presences and absences */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              Update the number of presences and absences for {editingFine?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="presences" className="text-right">
                Presences
              </Label>
              <Input
                id="presences"
                type="number"
                min="0"
                value={editedPresences}
                onChange={(e) => setEditedPresences(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="absences" className="text-right">
                Absences
              </Label>
              <Input
                id="absences"
                type="number"
                min="0"
                value={editedAbsences}
                onChange={(e) => setEditedAbsences(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirmEditAttendanceDialog(true)} disabled={isSaving}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for Edit Attendance */}
      <AlertDialog open={confirmEditAttendanceDialog} onOpenChange={setConfirmEditAttendanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Attendance Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the attendance for {editingFine?.name}? This will change their presences
              to {editedPresences} and absences to {editedAbsences}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmEditAttendanceDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEditedFine} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                      <TableHead>Actions</TableHead>
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
                          <div className="flex space-x-2">
                            {/* Edit button */}
                            <Button size="sm" variant="outline" onClick={() => handleEditFine(fine)}>
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Mark as cleared button */}
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
                          </div>
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
                            className={`text-xs ${fine.status === "Cleared" || fine.status === "penaltyCleared"
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
                        <div className="col-span-2 mt-2 flex space-x-2">
                          {/* Edit button for mobile */}
                          <Button size="sm" variant="outline" onClick={() => handleEditFine(fine)} className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>

                          {/* Mark as cleared button for mobile */}
                          {fine.status === "Pending" ? (
                            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  onClick={() => setSelectedFineId(fine.$id)}
                                  size="sm"
                                  className="flex-1 text-xs"
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
