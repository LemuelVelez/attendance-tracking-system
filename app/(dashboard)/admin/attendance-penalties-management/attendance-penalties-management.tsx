/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  MinusCircle,
  UserMinus,
  X,
  PlusCircle,
  UserPlus,
  CheckSquare,
  Filter,
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
  searchStudents,
  decreasePresencesForSelected,
  decreasePresencesExceptExempted,
  increasePresencesForSelected,
  increasePresencesExceptExempted,
  increasePresencesForAll,
  decreasePresencesForAll,
  getAllUsers,
  increasePresencesByYearAndProgram,
  decreasePresencesByYearAndProgram,
} from "@/lib/GeneralAttendance/GeneralAttendance"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

  // State for editing presences and absences
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFine, setEditingFine] = useState<FineDocument | null>(null)
  const [editedPresences, setEditedPresences] = useState("")
  const [editedAbsences, setEditedAbsences] = useState("")
  const [editedYearLevel, setEditedYearLevel] = useState("")
  const [editedDegreeProgram, setEditedDegreeProgram] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // State for penalties management
  const [penaltiesMap, setPenaltiesMap] = useState<Record<number, string>>({})
  const [penaltiesDialogOpen, setPenaltiesDialogOpen] = useState(false)
  const [newPenaltyKey, setNewPenaltyKey] = useState("")
  const [newPenaltyValue, setNewPenaltyValue] = useState("")
  const [editingPenaltyKey, setEditingPenaltyKey] = useState<number | null>(null)
  const [editingPenaltyValue, setEditingPenaltyValue] = useState("")
  const [isPenaltiesSaving, setIsPenaltiesSaving] = useState(false)

  // State for editing total events
  const [totalEventsDialogOpen, setTotalEventsDialogOpen] = useState(false)
  const [editedTotalEvents, setEditedTotalEvents] = useState("")
  const [isSavingTotalEvents, setIsSavingTotalEvents] = useState(false)

  // State for confirmation dialogs
  const [confirmTotalEventsDialog, setConfirmTotalEventsDialog] = useState(false)
  const [confirmPenaltiesDialog, setConfirmPenaltiesDialog] = useState(false)
  const [confirmEditAttendanceDialog, setConfirmEditAttendanceDialog] = useState(false)

  // State for penalty management confirmation dialogs
  const [confirmAddPenaltyDialog, setConfirmAddPenaltyDialog] = useState(false)
  const [confirmDeletePenaltyDialog, setConfirmDeletePenaltyDialog] = useState(false)
  const [penaltyToDelete, setPenaltyToDelete] = useState<number | null>(null)
  const [confirmEditPenaltyDialog, setConfirmEditPenaltyDialog] = useState(false)

  // State for mobile tab view
  const [activeTab, setActiveTab] = useState<"view" | "add">("view")

  // New state for student search and bulk operations
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FineDocument[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<FineDocument[]>([])
  const [bulkOperationDialogOpen, setBulkOperationDialogOpen] = useState(false)
  const [bulkOperationType, setBulkOperationType] = useState<
    | "decrease"
    | "exempt"
    | "increase"
    | "exempt-increase"
    | "increase-all"
    | "decrease-all"
    | "increase-by-year-program"
    | "decrease-by-year-program"
  >("decrease")
  const [changeAmount, setChangeAmount] = useState("1")
  const [isProcessingBulkOperation, setIsProcessingBulkOperation] = useState(false)
  const [confirmBulkOperationDialog, setConfirmBulkOperationDialog] = useState(false)

  // New state for year level and degree program filters
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>("")
  const [selectedDegreeProgram, setSelectedDegreeProgram] = useState<string>("")
  const [yearLevels, setYearLevels] = useState<string[]>([])
  const [degreePrograms, setDegreePrograms] = useState<string[]>([])

  // New state for new students table
  const [newStudentsDialogOpen, setNewStudentsDialogOpen] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [newStudentsSearchTerm, setNewStudentsSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isAddingNewStudent, setIsAddingNewStudent] = useState(false)
  const [confirmAddNewStudentDialog, setConfirmAddNewStudentDialog] = useState(false)

  // New state for adding multiple students
  const [selectedNewUsers, setSelectedNewUsers] = useState<any[]>([])
  const [selectAllNewUsers, setSelectAllNewUsers] = useState(false)
  const [initialPresences, setInitialPresences] = useState("0")
  const [confirmAddMultipleDialog, setConfirmAddMultipleDialog] = useState(false)
  const [isAddingMultipleStudents, setIsAddingMultipleStudents] = useState(false)

  // New state for year level and degree program search and selection
  const [yearLevelSearchTerm, setYearLevelSearchTerm] = useState("")
  const [degreeProgramSearchTerm, setDegreeProgramSearchTerm] = useState("")
  const [filteredYearLevels, setFilteredYearLevels] = useState<string[]>([])
  const [filteredDegreePrograms, setFilteredDegreePrograms] = useState<string[]>([])
  const [selectedYearLevels, setSelectedYearLevels] = useState<string[]>([])
  const [selectedDegreePrograms, setSelectedDegreePrograms] = useState<string[]>([])
  const [selectAllYearLevels, setSelectAllYearLevels] = useState(false)
  const [selectAllDegreePrograms, setSelectAllDegreePrograms] = useState(false)
  const [showYearLevelSearch, setShowYearLevelSearch] = useState(false)
  const [showDegreeProgramSearch, setShowDegreeProgramSearch] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

      // Extract unique year levels and degree programs
      const uniqueYearLevels = [...new Set(finesData.map((f) => f.yearLevel).filter((y): y is string => Boolean(y)))]
      const uniqueDegreePrograms = [
        ...new Set(finesData.map((f) => f.degreeProgram).filter((d): d is string => Boolean(d))),
      ]

      setYearLevels(uniqueYearLevels)
      setDegreePrograms(uniqueDegreePrograms)
      setFilteredYearLevels(uniqueYearLevels)
      setFilteredDegreePrograms(uniqueDegreePrograms)
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

  // Filter year levels based on search term
  useEffect(() => {
    if (yearLevelSearchTerm.trim() === "") {
      setFilteredYearLevels(yearLevels)
    } else {
      const searchTermLower = yearLevelSearchTerm.toLowerCase()
      const filtered = yearLevels.filter((yearLevel) => yearLevel.toLowerCase().includes(searchTermLower))
      setFilteredYearLevels(filtered)
    }
  }, [yearLevelSearchTerm, yearLevels])

  // Filter degree programs based on search term
  useEffect(() => {
    if (degreeProgramSearchTerm.trim() === "") {
      setFilteredDegreePrograms(degreePrograms)
    } else {
      const searchTermLower = degreeProgramSearchTerm.toLowerCase()
      const filtered = degreePrograms.filter((program) => program.toLowerCase().includes(searchTermLower))
      setFilteredDegreePrograms(filtered)
    }
  }, [degreeProgramSearchTerm, degreePrograms])

  // Handle student search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Don't clear previous results immediately to avoid flickering
    if (studentSearchTerm.trim().length === 0) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Set searching state immediately to show loading indicator
    setIsSearching(true)

    // Make sure the popover is open when searching
    if (studentSearchTerm.trim().length > 0 && !searchPopoverOpen) {
      setSearchPopoverOpen(true)
    }

    // Use a short debounce time for responsive search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("Searching for:", studentSearchTerm.trim())

        // For direct search in the UI, use the same approach as the main search
        if (studentSearchTerm.trim().length > 0) {
          // First try the backend search
          const results = await searchStudents(studentSearchTerm.trim())
          console.log("Backend search results:", results.length)

          // If backend search returns results, use them
          if (results.length > 0) {
            setSearchResults(results)
            if (results.length > 0 && !searchPopoverOpen) {
              setSearchPopoverOpen(true)
            }
          } else {
            // If backend search fails, try a client-side search as fallback
            console.log("Trying fallback client-side search")
            const searchTermLower = studentSearchTerm.toLowerCase().trim()
            const searchWords = searchTermLower.split(/\s+/).filter((word) => word.length > 0)

            const clientResults = fines
              .filter((fine) => {
                const name = fine.name.toLowerCase()
                const studentId = fine.studentId.toLowerCase()

                // Check for direct match
                if (name.includes(searchTermLower) || studentId.includes(searchTermLower)) {
                  return true
                }

                // Check if all words in search term are in the name
                if (searchWords.length > 1) {
                  return searchWords.every((word) => name.includes(word))
                }

                return false
              })
              .slice(0, 20)

            console.log("Client-side search results:", clientResults.length)
            setSearchResults(clientResults)
            if (clientResults.length > 0 && !searchPopoverOpen) {
              setSearchPopoverOpen(true)
            }
          }
        }
      } catch (error) {
        console.error("Error searching students:", error)
        toast({
          title: "Error",
          description: "Failed to search students. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    }, 100) // Keep at 100ms for fast response

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [studentSearchTerm, toast, searchPopoverOpen, fines])

  // Handle new students search
  useEffect(() => {
    if (!allUsers.length) return

    const filtered = allUsers.filter((user) => {
      if (newStudentsSearchTerm.trim() === "") return true

      const searchTermLower = newStudentsSearchTerm.toLowerCase().trim()
      return (
        user.name.toLowerCase().includes(searchTermLower) ||
        user.studentId.toLowerCase().includes(searchTermLower) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower))
      )
    })

    setFilteredUsers(filtered)
  }, [newStudentsSearchTerm, allUsers])

  // Function to fetch users not in fines
  const fetchNewUsers = async () => {
    setIsLoadingUsers(true)
    try {
      // Get all users
      const users = await getAllUsers()

      // Get all existing fines
      const existingFines = await getFineDocuments()

      // Create a set of student IDs that already have fines
      const existingStudentIds = new Set(existingFines.map((fine) => fine.studentId))

      // Filter users to only include those not in the fines collection
      const newUsers = users.filter((user) => !existingStudentIds.has(user.studentId))

      setAllUsers(newUsers)
      setFilteredUsers(newUsers)
      setSelectedNewUsers([]) // Reset selected users
      setSelectAllNewUsers(false) // Reset select all checkbox
    } catch (error) {
      console.error("Error fetching new users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch new users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Function to add a new student to fines management
  const handleAddNewStudent = async () => {
    if (!selectedUser) return

    setIsAddingNewStudent(true)
    try {
      // Get total events
      const totalEventsCount = await getTotalUniqueEvents()

      // Create a new fine document for the user
      const fineData: FineDocumentData = {
        userId: selectedUser.$id,
        studentId: selectedUser.studentId,
        name: selectedUser.name,
        absences: (totalEventsCount - Number(initialPresences)).toString(), // Calculate absences based on presences
        presences: initialPresences, // Use the specified initial presences
        penalties: "", // Will be calculated by createFineDocument
        dateIssued: new Date().toISOString().split("T")[0],
        status: "Pending",
        yearLevel: selectedUser.yearLevel || "",
        degreeProgram: selectedUser.degreeProgram || "",
      }

      await createFineDocument(fineData)

      toast({
        title: "Success",
        description: `${selectedUser.name} has been added to the fines management system.`,
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })

      // Refresh data
      await fetchData()

      // Reset state
      setSelectedUser(null)
      setNewStudentsDialogOpen(false)
      setInitialPresences("0") // Reset initial presences
    } catch (error) {
      console.error("Error adding new student:", error)
      toast({
        title: "Error",
        description: "Failed to add new student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingNewStudent(false)
      setConfirmAddNewStudentDialog(false)
    }
  }

  // Function to add multiple students
  const handleAddMultipleStudents = async () => {
    if (selectedNewUsers.length === 0) {
      toast({
        title: "Error",
        description: "No students selected for adding.",
        variant: "destructive",
      })
      return
    }

    setIsAddingMultipleStudents(true)
    try {
      // Get total events
      const totalEventsCount = await getTotalUniqueEvents()

      // Show a processing toast
      toast({
        title: "Processing",
        description: `Adding ${selectedNewUsers.length} students. Please wait...`,
        variant: "default",
      })

      // Process in batches to avoid overwhelming the API
      const batchSize = 10
      const batches = []

      for (let i = 0; i < selectedNewUsers.length; i += batchSize) {
        batches.push(selectedNewUsers.slice(i, i + batchSize))
      }

      let addedCount = 0

      // Process each batch with a delay between batches
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]

        // Process each user in the batch
        for (const user of batch) {
          // Create a new fine document for the user
          const fineData: FineDocumentData = {
            userId: user.$id,
            studentId: user.studentId,
            name: user.name,
            absences: (totalEventsCount - Number(initialPresences)).toString(), // Calculate absences based on presences
            presences: initialPresences, // Use the specified initial presences
            penalties: "", // Will be calculated by createFineDocument
            dateIssued: new Date().toISOString().split("T")[0],
            status: "Pending",
            yearLevel: user.yearLevel || "",
            degreeProgram: user.degreeProgram || "",
          }

          await createFineDocument(fineData)
          addedCount++

          // Add a small delay between operations
          await new Promise((resolve) => setTimeout(resolve, 200))
        }

        // Add a longer delay between batches
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      toast({
        title: "Success",
        description: `Added ${addedCount} students to the fines management system.`,
        variant: "success",
        className: "border-green-500 text-green-700 bg-green-50",
      })

      // Refresh data
      await fetchData()

      // Reset state
      setSelectedNewUsers([])
      setSelectAllNewUsers(false)
      setNewStudentsDialogOpen(false)
      setInitialPresences("0") // Reset initial presences
    } catch (error) {
      console.error("Error adding multiple students:", error)
      toast({
        title: "Error",
        description: "Failed to add students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingMultipleStudents(false)
      setConfirmAddMultipleDialog(false)
    }
  }

  // Function to handle selecting/deselecting all new users
  const handleSelectAllNewUsers = (checked: boolean) => {
    setSelectAllNewUsers(checked)
    if (checked) {
      setSelectedNewUsers([...filteredUsers])
    } else {
      setSelectedNewUsers([])
    }
  }

  // Function to handle selecting/deselecting a single new user
  const handleSelectNewUser = (user: any, checked: boolean) => {
    if (checked) {
      setSelectedNewUsers((prev) => [...prev, user])
    } else {
      setSelectedNewUsers((prev) => prev.filter((u) => u.$id !== user.$id))
    }
  }

  // Function to handle selecting/deselecting all year levels
  const handleSelectAllYearLevels = (checked: boolean) => {
    setSelectAllYearLevels(checked)
    if (checked) {
      setSelectedYearLevels([...filteredYearLevels])
    } else {
      setSelectedYearLevels([])
    }
  }

  // Function to handle selecting/deselecting a single year level
  const handleSelectYearLevel = (yearLevel: string, checked: boolean) => {
    if (checked) {
      setSelectedYearLevels((prev) => [...prev, yearLevel])
    } else {
      setSelectedYearLevels((prev) => prev.filter((yl) => yl !== yearLevel))
    }
  }

  // Function to handle selecting/deselecting all degree programs
  const handleSelectAllDegreePrograms = (checked: boolean) => {
    setSelectAllDegreePrograms(checked)
    if (checked) {
      setSelectedDegreePrograms([...filteredDegreePrograms])
    } else {
      setSelectedDegreePrograms([])
    }
  }

  // Function to handle selecting/deselecting a single degree program
  const handleSelectDegreeProgram = (program: string, checked: boolean) => {
    if (checked) {
      setSelectedDegreePrograms((prev) => [...prev, program])
    } else {
      setSelectedDegreePrograms((prev) => prev.filter((p) => p !== program))
    }
  }

  // Function to handle bulk operations for selected year levels and degree programs
  const handleYearLevelDegreeProgramOperation = (operationType: "increase" | "decrease") => {
    // If no selections made, use the dropdown values
    const yearLevelsToUse =
      selectedYearLevels.length > 0 ? selectedYearLevels : selectedYearLevel ? [selectedYearLevel] : []
    const degreeProgramsToUse =
      selectedDegreePrograms.length > 0 ? selectedDegreePrograms : selectedDegreeProgram ? [selectedDegreeProgram] : []

    // Set the operation type
    setBulkOperationType(operationType === "increase" ? "increase-by-year-program" : "decrease-by-year-program")

    // If multiple year levels or degree programs are selected, process them sequentially
    if (yearLevelsToUse.length > 1 || degreeProgramsToUse.length > 1) {
      // Store the selections for processing
      localStorage.setItem("yearLevelsToProcess", JSON.stringify(yearLevelsToUse))
      localStorage.setItem("degreeProgramsToProcess", JSON.stringify(degreeProgramsToUse))

      // Start with the first combination
      setSelectedYearLevel(yearLevelsToUse.length > 0 ? yearLevelsToUse[0] : "all")
      setSelectedDegreeProgram(degreeProgramsToUse.length > 0 ? degreeProgramsToUse[0] : "all")
    }

    // Open the bulk operation dialog
    setBulkOperationDialogOpen(true)
  }

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
        yearLevel: fineToUpdate.yearLevel || "",
        degreeProgram: fineToUpdate.degreeProgram || "",
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

  // Function to handle editing a fine
  const handleEditFine = (fine: FineDocument) => {
    setEditingFine(fine)
    setEditedPresences(fine.presences)
    setEditedAbsences(fine.absences)
    setEditedYearLevel(fine.yearLevel || "")
    setEditedDegreeProgram(fine.degreeProgram || "")
    setEditDialogOpen(true)
  }

  // Function to save edited fine
  const handleSaveEditedFine = async () => {
    if (!editingFine) return

    setIsSaving(true)
    try {
      const updatedFineData: FineDocumentData = {
        userId: editingFine.userId,
        studentId: editingFine.studentId,
        name: editingFine.name,
        absences: editedAbsences,
        presences: editedPresences,
        penalties: editingFine.penalties,
        dateIssued: editingFine.dateIssued,
        status: editingFine.status,
        yearLevel: editedYearLevel,
        degreeProgram: editedDegreeProgram,
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

  // Function to save penalties map
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

  // Function to add a penalty
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

  // Function to delete a penalty
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

  // Function to start editing a penalty
  const handleStartEditPenalty = (key: number, value: string) => {
    setEditingPenaltyKey(key)
    setEditingPenaltyValue(value)
  }

  // Function to save edited penalty
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

  // Function to save edited total events
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

  // Function to handle selecting a student from search results
  const handleSelectStudent = (student: FineDocument) => {
    setSelectedStudents((prev) => {
      // Check if student is already selected
      if (prev.some((s) => s.studentId === student.studentId)) {
        return prev
      }
      return [...prev, student]
    })
    setSearchPopoverOpen(false)
    setStudentSearchTerm("")
  }

  // Function to remove a student from selection
  const handleRemoveSelectedStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.studentId !== studentId))
  }

  // Function to handle bulk operation
  const handleBulkOperation = async () => {
    setIsProcessingBulkOperation(true)
    setConfirmBulkOperationDialog(false) // Close the confirmation dialog immediately

    try {
      const amount = Number.parseInt(changeAmount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid positive number for the change amount.",
          variant: "destructive",
        })
        setIsProcessingBulkOperation(false)
        return
      }

      const studentIds = selectedStudents.map((s) => s.studentId)

      // Show a processing toast
      toast({
        title: "Processing",
        description: `Processing ${bulkOperationType} operation. Please wait...`,
        variant: "default",
      })

      switch (bulkOperationType) {
        case "decrease":
          // Decrease presences for selected students
          await decreasePresencesForSelected(studentIds, amount)
          toast({
            title: "Success",
            description: `Decreased presences by ${amount} for ${studentIds.length} selected students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "exempt":
          // Decrease presences for all except exempted students
          await decreasePresencesExceptExempted(studentIds, amount)
          toast({
            title: "Success",
            description: `Decreased presences by ${amount} for all students except ${studentIds.length} exempted students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "increase":
          // Increase presences for selected students
          await increasePresencesForSelected(studentIds, amount)
          toast({
            title: "Success",
            description: `Increased presences by ${amount} for ${studentIds.length} selected students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "exempt-increase":
          // Increase presences for all except exempted students
          await increasePresencesExceptExempted(studentIds, amount)
          toast({
            title: "Success",
            description: `Increased presences by ${amount} for all students except ${studentIds.length} exempted students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "increase-all":
          // Increase presences for all students
          await increasePresencesForAll(amount)
          toast({
            title: "Success",
            description: `Increased presences by ${amount} for all students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "decrease-all":
          // Decrease presences for all students
          await decreasePresencesForAll(amount)
          toast({
            title: "Success",
            description: `Decreased presences by ${amount} for all students.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "increase-by-year-program":
          // Increase presences by year level and degree program
          await increasePresencesByYearAndProgram(selectedYearLevel, selectedDegreeProgram, amount)
          toast({
            title: "Success",
            description: `Increased presences by ${amount} for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
        case "decrease-by-year-program":
          // Decrease presences by year level and degree program
          await decreasePresencesByYearAndProgram(selectedYearLevel, selectedDegreeProgram, amount)
          toast({
            title: "Success",
            description: `Decreased presences by ${amount} for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}.`,
            variant: "success",
            className: "border-green-500 text-green-700 bg-green-50",
          })
          break
      }

      // Refresh data
      await fetchData()

      // Reset state
      setBulkOperationDialogOpen(false)
      setSelectedStudents([])
      setChangeAmount("1")
    } catch (error) {
      console.error("Error performing bulk operation:", error)
      toast({
        title: "Error",
        description: "Failed to perform bulk operation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingBulkOperation(false)
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
                        SaveChanges
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

      {/* New Card for Student Selection and Bulk Operations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="w-5 h-5 mr-2" />
            Student Selection and Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="studentSearch" className="mb-2 block">
                  Search and Select Students
                </Label>
                <Popover
                  open={searchPopoverOpen}
                  onOpenChange={(open) => {
                    setSearchPopoverOpen(open)
                    // Don't clear results when opening, only when explicitly clearing the search
                    if (!open && studentSearchTerm.trim() === "") {
                      setSearchResults([])
                    }
                  }}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchPopoverOpen}
                      className="w-full justify-between"
                      onClick={() => setSearchPopoverOpen(true)}
                    >
                      {studentSearchTerm || "Search students..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start" sideOffset={4} side="bottom">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search students..."
                        value={studentSearchTerm}
                        onValueChange={(value) => {
                          setStudentSearchTerm(value)
                          // Ensure popover stays open while typing
                          if (!searchPopoverOpen) {
                            setSearchPopoverOpen(true)
                          }
                        }}
                        className="border-none focus:ring-0"
                        autoComplete="off"
                        autoFocus
                      />
                      <CommandList className="max-h-[300px] overflow-auto">
                        <CommandEmpty>
                          {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Searching...</span>
                            </div>
                          ) : studentSearchTerm.trim() ? (
                            "No students found."
                          ) : (
                            "Type to search for students."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {searchResults.map((student) => (
                            <CommandItem
                              key={student.$id}
                              onSelect={() => handleSelectStudent(student)}
                              className="cursor-pointer flex items-center"
                              value={`${student.name} ${student.studentId}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedStudents.some((s) => s.studentId === student.studentId)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{student.name}</span>
                                <span className="text-xs text-gray-500">{student.studentId}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="mb-2 block">Selected Students ({selectedStudents.length})</Label>
                <div className="border rounded-md p-2 min-h-[38px] max-h-[100px] overflow-y-auto">
                  {selectedStudents.length === 0 ? (
                    <p className="text-sm text-gray-500">No students selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedStudents.map((student) => (
                        <Badge key={student.studentId} variant="secondary" className="flex items-center gap-1">
                          {student.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => handleRemoveSelectedStudent(student.studentId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* First row of buttons - Decrease operations */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={() => {
                  setBulkOperationType("decrease")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={selectedStudents.length === 0 || isProcessingBulkOperation}
                className="flex-1"
              >
                {isProcessingBulkOperation && bulkOperationType === "decrease" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Decrease Presences for Selected
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setBulkOperationType("exempt")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={selectedStudents.length === 0 || isProcessingBulkOperation}
                className="flex-1"
              >
                {isProcessingBulkOperation && bulkOperationType === "exempt" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Exempt from Decrease
                  </>
                )}
              </Button>
            </div>

            {/* Second row of buttons - Increase operations */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={() => {
                  setBulkOperationType("increase")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={selectedStudents.length === 0 || isProcessingBulkOperation}
                className="flex-1"
                variant="outline"
              >
                {isProcessingBulkOperation && bulkOperationType === "increase" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Increase Presences for Selected
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setBulkOperationType("exempt-increase")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={selectedStudents.length === 0 || isProcessingBulkOperation}
                className="flex-1"
                variant="outline"
              >
                {isProcessingBulkOperation && bulkOperationType === "exempt-increase" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Exempt from Increase
                  </>
                )}
              </Button>
            </div>

            {/* New row for global operations */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={() => {
                  setBulkOperationType("increase-all")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={isProcessingBulkOperation}
                className="flex-1"
                variant="default"
              >
                {isProcessingBulkOperation && bulkOperationType === "increase-all" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Increase Presences for All
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setBulkOperationType("decrease-all")
                  setBulkOperationDialogOpen(true)
                }}
                disabled={isProcessingBulkOperation}
                className="flex-1"
                variant="default"
              >
                {isProcessingBulkOperation && bulkOperationType === "decrease-all" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Decrease Presences for All
                  </>
                )}
              </Button>
            </div>

            {/* Enhanced section for year level and degree program operations */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-medium mb-3">Operations by Year Level and Degree Program</h3>

              {/* Year Level Search and Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="yearLevel" className="font-medium">
                    Year Level
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowYearLevelSearch(!showYearLevelSearch)}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    {showYearLevelSearch ? "Hide Search" : "Search & Select"}
                  </Button>
                </div>

                {showYearLevelSearch ? (
                  <div className="space-y-2 border rounded-md p-3">
                    <div className="relative">
                      <Input
                        placeholder="Search year levels..."
                        value={yearLevelSearchTerm}
                        onChange={(e) => setYearLevelSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                      <div className="flex items-center mb-2 pb-1 border-b">
                        <Checkbox
                          id="select-all-year-levels"
                          checked={selectAllYearLevels}
                          onCheckedChange={handleSelectAllYearLevels}
                        />
                        <Label htmlFor="select-all-year-levels" className="ml-2 font-medium">
                          Select All ({filteredYearLevels.length})
                        </Label>
                      </div>

                      {filteredYearLevels.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No year levels found</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredYearLevels.map((yearLevel) => (
                            <div key={yearLevel} className="flex items-center">
                              <Checkbox
                                id={`year-level-${yearLevel}`}
                                checked={selectedYearLevels.includes(yearLevel)}
                                onCheckedChange={(checked) => handleSelectYearLevel(yearLevel, !!checked)}
                              />
                              <Label htmlFor={`year-level-${yearLevel}`} className="ml-2">
                                {yearLevel}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{selectedYearLevels.length} selected</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedYearLevels([])
                          setSelectAllYearLevels(false)
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select value={selectedYearLevel} onValueChange={setSelectedYearLevel}>
                    <SelectTrigger id="yearLevel">
                      <SelectValue placeholder="Select Year Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Year Levels</SelectItem>
                      {yearLevels.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Degree Program Search and Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="degreeProgram" className="font-medium">
                    Degree Program
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowDegreeProgramSearch(!showDegreeProgramSearch)}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    {showDegreeProgramSearch ? "Hide Search" : "Search & Select"}
                  </Button>
                </div>

                {showDegreeProgramSearch ? (
                  <div className="space-y-2 border rounded-md p-3">
                    <div className="relative">
                      <Input
                        placeholder="Search degree programs..."
                        value={degreeProgramSearchTerm}
                        onChange={(e) => setDegreeProgramSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                      <div className="flex items-center mb-2 pb-1 border-b">
                        <Checkbox
                          id="select-all-degree-programs"
                          checked={selectAllDegreePrograms}
                          onCheckedChange={handleSelectAllDegreePrograms}
                        />
                        <Label htmlFor="select-all-degree-programs" className="ml-2 font-medium">
                          Select All ({filteredDegreePrograms.length})
                        </Label>
                      </div>

                      {filteredDegreePrograms.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No degree programs found</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredDegreePrograms.map((program) => (
                            <div key={program} className="flex items-center">
                              <Checkbox
                                id={`degree-program-${program}`}
                                checked={selectedDegreePrograms.includes(program)}
                                onCheckedChange={(checked) => handleSelectDegreeProgram(program, !!checked)}
                              />
                              <Label htmlFor={`degree-program-${program}`} className="ml-2">
                                {program}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{selectedDegreePrograms.length} selected</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDegreePrograms([])
                          setSelectAllDegreePrograms(false)
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select value={selectedDegreeProgram} onValueChange={setSelectedDegreeProgram}>
                    <SelectTrigger id="degreeProgram">
                      <SelectValue placeholder="Select Degree Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {degreePrograms.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Selection Summary */}
              {(selectedYearLevels.length > 0 || selectedDegreePrograms.length > 0) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Current Selection:</h4>
                  {selectedYearLevels.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium">Year Levels:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedYearLevels.map((yl) => (
                          <Badge key={yl} variant="outline" className="text-xs">
                            {yl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDegreePrograms.length > 0 && (
                    <div>
                      <span className="text-xs font-medium">Degree Programs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDegreePrograms.map((dp) => (
                          <Badge key={dp} variant="outline" className="text-xs">
                            {dp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleYearLevelDegreeProgramOperation("increase")}
                  disabled={isProcessingBulkOperation}
                  className="flex-1"
                  variant="outline"
                >
                  {isProcessingBulkOperation && bulkOperationType === "increase-by-year-program" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Increase Presences
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleYearLevelDegreeProgramOperation("decrease")}
                  disabled={isProcessingBulkOperation}
                  className="flex-1"
                  variant="outline"
                >
                  {isProcessingBulkOperation && bulkOperationType === "decrease-by-year-program" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MinusCircle className="mr-2 h-4 w-4" />
                      Decrease Presences
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operation Dialog */}
      <AlertDialog open={bulkOperationDialogOpen} onOpenChange={setBulkOperationDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkOperationType === "decrease"
                ? "Decrease Presences for Selected Students"
                : bulkOperationType === "exempt"
                  ? "Exempt Selected Students from Decrease"
                  : bulkOperationType === "increase"
                    ? "Increase Presences for Selected Students"
                    : bulkOperationType === "exempt-increase"
                      ? "Exempt Selected Students from Increase"
                      : bulkOperationType === "increase-all"
                        ? "Increase Presences for All Students"
                        : bulkOperationType === "decrease-all"
                          ? "Decrease Presences for All Students"
                          : bulkOperationType === "increase-by-year-program"
                            ? "Increase Presences by Year Level and Program"
                            : "Decrease Presences by Year Level and Program"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkOperationType === "decrease"
                ? `This will decrease the presences count for ${selectedStudents.length} selected students.`
                : bulkOperationType === "exempt"
                  ? `This will decrease the presences count for all students EXCEPT the ${selectedStudents.length} selected students.`
                  : bulkOperationType === "increase"
                    ? `This will increase the presences count for ${selectedStudents.length} selected students.`
                    : bulkOperationType === "exempt-increase"
                      ? `This will increase the presences count for all students EXCEPT the ${selectedStudents.length} selected students.`
                      : bulkOperationType === "increase-all"
                        ? "This will increase the presences count for ALL students."
                        : bulkOperationType === "decrease-all"
                          ? "This will decrease the presences count for ALL students."
                          : bulkOperationType === "increase-by-year-program"
                            ? selectedYearLevels.length > 0 || selectedDegreePrograms.length > 0
                              ? `This will increase the presences count for students in ${selectedYearLevels.length > 0 ? `selected year levels (${selectedYearLevels.length})` : selectedYearLevel || "all years"}, ${selectedDegreePrograms.length > 0 ? `selected programs (${selectedDegreePrograms.length})` : selectedDegreeProgram || "all programs"}.`
                              : `This will increase the presences count for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}.`
                            : selectedYearLevels.length > 0 || selectedDegreePrograms.length > 0
                              ? `This will decrease the presences count for students in ${selectedYearLevels.length > 0 ? `selected year levels (${selectedYearLevels.length})` : selectedYearLevel || "all years"}, ${selectedDegreePrograms.length > 0 ? `selected programs (${selectedDegreePrograms.length})` : selectedDegreeProgram || "all programs"}.`
                              : `This will decrease the presences count for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="changeAmount">
                {bulkOperationType.includes("decrease") ? "Decrease" : "Increase"} Amount
              </Label>
              <Input
                id="changeAmount"
                type="number"
                min="1"
                value={changeAmount}
                onChange={(e) => setChangeAmount(e.target.value)}
                placeholder={`Enter ${bulkOperationType.includes("decrease") ? "decrease" : "increase"} amount`}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkOperationDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirmBulkOperationDialog(true)} disabled={isProcessingBulkOperation}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for Bulk Operation */}
      <AlertDialog open={confirmBulkOperationDialog} onOpenChange={setConfirmBulkOperationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Operation</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkOperationType === "decrease"
                ? `Are you sure you want to decrease presences by ${changeAmount} for ${selectedStudents.length} selected students?`
                : bulkOperationType === "exempt"
                  ? `Are you sure you want to decrease presences by ${changeAmount} for all students EXCEPT the ${selectedStudents.length} selected students?`
                  : bulkOperationType === "increase"
                    ? `Are you sure you want to increase presences by ${changeAmount} for ${selectedStudents.length} selected students?`
                    : bulkOperationType === "exempt-increase"
                      ? `Are you sure you want to increase presences by ${changeAmount} for all students EXCEPT the ${selectedStudents.length} selected students?`
                      : bulkOperationType === "increase-all"
                        ? `Are you sure you want to increase presences by ${changeAmount} for ALL students?`
                        : bulkOperationType === "decrease-all"
                          ? `Are you sure you want to decrease presences by ${changeAmount} for ALL students?`
                          : bulkOperationType === "increase-by-year-program"
                            ? selectedYearLevels.length > 0 || selectedDegreePrograms.length > 0
                              ? `Are you sure you want to increase presences by ${changeAmount} for students in ${selectedYearLevels.length > 0 ? `selected year levels (${selectedYearLevels.length})` : selectedYearLevel || "all years"}, ${selectedDegreePrograms.length > 0 ? `selected programs (${selectedDegreePrograms.length})` : selectedDegreeProgram || "all programs"}?`
                              : `Are you sure you want to increase presences by ${changeAmount} for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}?`
                            : selectedYearLevels.length > 0 || selectedDegreePrograms.length > 0
                              ? `Are you sure you want to decrease presences by ${changeAmount} for students in ${selectedYearLevels.length > 0 ? `selected year levels (${selectedYearLevels.length})` : selectedYearLevel || "all years"}, ${selectedDegreePrograms.length > 0 ? `selected programs (${selectedDegreePrograms.length})` : selectedDegreeProgram || "all programs"}?`
                              : `Are you sure you want to decrease presences by ${changeAmount} for students in ${selectedYearLevel || "all years"}, ${selectedDegreeProgram || "all programs"}?`}
              This will affect their absences and penalties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmBulkOperationDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkOperation} disabled={isProcessingBulkOperation}>
              {isProcessingBulkOperation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

        {/* Button for adding new students */}
        <AlertDialog open={newStudentsDialogOpen} onOpenChange={setNewStudentsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" onClick={() => fetchNewUsers()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Student to Fines Management</AlertDialogTitle>
              <AlertDialogDescription>
                Add students who were registered after fines were generated without updating all fines.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <div className="mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="newStudentSearch" className="mb-2 block">
                      Search for Student
                    </Label>
                    <div className="relative">
                      <Input
                        id="newStudentSearch"
                        placeholder="Search by name or student ID"
                        value={newStudentsSearchTerm}
                        onChange={(e) => setNewStudentsSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="initialPresences" className="mb-2 block">
                      Initial Presences
                    </Label>
                    <Input
                      id="initialPresences"
                      type="number"
                      min="0"
                      value={initialPresences}
                      onChange={(e) => setInitialPresences(e.target.value)}
                      placeholder="Enter initial presences"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedNewUsers.length > 0) {
                        setConfirmAddMultipleDialog(true)
                      } else {
                        toast({
                          title: "No Students Selected",
                          description: "Please select at least one student to add.",
                          variant: "destructive",
                        })
                      }
                    }}
                    disabled={selectedNewUsers.length === 0 || isAddingMultipleStudents}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Add Selected ({selectedNewUsers.length})
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      if (filteredUsers.length > 0) {
                        setSelectedNewUsers(filteredUsers)
                        setSelectAllNewUsers(true)
                        setConfirmAddMultipleDialog(true)
                      } else {
                        toast({
                          title: "No Students Available",
                          description: "There are no new students to add.",
                          variant: "destructive",
                        })
                      }
                    }}
                    disabled={filteredUsers.length === 0 || isAddingMultipleStudents}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Add All ({filteredUsers.length})
                  </Button>
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <span>Loading students...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <p className="text-gray-500">
                    No new students found. All registered students are already in the fines management system.
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectAllNewUsers}
                            onCheckedChange={handleSelectAllNewUsers}
                            id="select-all-new-users"
                          />
                        </TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Degree Program</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.$id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedNewUsers.some((u) => u.$id === user.$id)}
                              onCheckedChange={(checked) => handleSelectNewUser(user, !!checked)}
                              id={`select-user-${user.$id}`}
                            />
                          </TableCell>
                          <TableCell>{user.studentId}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.yearLevel || "-"}</TableCell>
                          <TableCell>{user.degreeProgram || "-"}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setConfirmAddNewStudentDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setNewStudentsDialogOpen(false)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for adding new student */}
        <AlertDialog open={confirmAddNewStudentDialog} onOpenChange={setConfirmAddNewStudentDialog}>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Add Student to Fines Management</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser
                  ? `Add ${selectedUser.name} to the fines management system.`
                  : "Add student to the fines management system."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Year Level</Label>
                <p className="text-sm border p-2 rounded-md bg-gray-50">{selectedUser?.yearLevel || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <Label>Degree Program</Label>
                <p className="text-sm border p-2 rounded-md bg-gray-50">
                  {selectedUser?.degreeProgram || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Initial Presences</Label>
                <p className="text-sm border p-2 rounded-md bg-gray-50">{initialPresences}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmAddNewStudentDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddNewStudent} disabled={isAddingNewStudent}>
                {isAddingNewStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation dialog for adding multiple students */}
        <AlertDialog open={confirmAddMultipleDialog} onOpenChange={setConfirmAddMultipleDialog}>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Add Multiple Students</AlertDialogTitle>
              <AlertDialogDescription>
                Add {selectedNewUsers.length} students to the fines management system with {initialPresences} initial
                presences.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p>This will add the following students:</p>
              <div className="mt-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {selectedNewUsers.slice(0, 10).map((user) => (
                  <div key={user.$id} className="text-sm py-1 border-b last:border-0">
                    {user.name} ({user.studentId})
                  </div>
                ))}
                {selectedNewUsers.length > 10 && (
                  <div className="text-sm py-1 text-gray-500 italic">...and {selectedNewUsers.length - 10} more</div>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmAddMultipleDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddMultipleStudents} disabled={isAddingMultipleStudents}>
                {isAddingMultipleStudents ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Students"
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

            {/* Mobile view: Use buttons instead of tabs */}
            <div className="block sm:hidden mt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col w-full border-b pb-4 space-y-2">
                  <Button
                    variant={activeTab === "view" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setActiveTab("view")}
                  >
                    View Penalties
                  </Button>
                  <Button
                    variant={activeTab === "add" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setActiveTab("add")}
                  >
                    Add New Penalty
                  </Button>
                </div>

                {activeTab === "view" && (
                  <div className="space-y-4">
                    {Object.entries(penaltiesMap)
                      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                      .map(([key, value]) => {
                        const numKey = Number.parseInt(key)
                        return (
                          <div key={key} className="flex flex-col items-start py-4 border-b gap-2">
                            {/* Mobile label for absences */}
                            <div className="font-medium text-sm">Absences:</div>
                            <div>{key}</div>

                            {/* Mobile label for penalty */}
                            <div className="font-medium text-sm">Penalty:</div>
                            <div className="w-full">
                              {editingPenaltyKey === numKey ? (
                                <Textarea
                                  value={editingPenaltyValue}
                                  onChange={(e) => setEditingPenaltyValue(e.target.value)}
                                  className="min-h-[80px] w-full"
                                />
                              ) : (
                                <p className="text-sm">{value}</p>
                              )}
                            </div>

                            {/* Mobile label for actions */}
                            <div className="font-medium text-sm">Actions:</div>
                            <div className="flex space-x-2 w-full justify-start">
                              {editingPenaltyKey === numKey ? (
                                <Button size="sm" onClick={() => setConfirmEditPenaltyDialog(true)}>
                                  Save
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartEditPenalty(numKey, value)}
                                >
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
                )}

                {activeTab === "add" && (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="absences-mobile">Number of Absences</Label>
                        <Input
                          id="absences-mobile"
                          type="number"
                          min="0"
                          value={newPenaltyKey}
                          onChange={(e) => setNewPenaltyKey(e.target.value)}
                          placeholder="Enter number of absences"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="penalty-mobile">Penalty Description</Label>
                        <Textarea
                          id="penalty-mobile"
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
                )}
              </div>
            </div>

            {/* Desktop view: Use tabs */}
            <Tabs defaultValue="view" className="hidden sm:block mt-4">
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
                                className="min-h-[80px] w-full"
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

            <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto" onClick={() => setPenaltiesDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="w-full sm:w-auto"
                onClick={() => setConfirmPenaltiesDialog(true)}
                disabled={isPenaltiesSaving}
              >
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
              <AlertDialogAction onClick={() => penaltyToDelete !== null && handleDeletePenalty(penaltyToDelete)}>
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
            <AlertDialogDescription>Update the attendance information for {editingFine?.name}.</AlertDialogDescription>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yearLevel" className="text-right">
                Year Level
              </Label>
              <Input
                id="yearLevel"
                value={editedYearLevel}
                onChange={(e) => setEditedYearLevel(e.target.value)}
                className="col-span-3"
                placeholder="e.g. 1st Year"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="degreeProgram" className="text-right">
                Degree Program
              </Label>
              <Input
                id="degreeProgram"
                value={editedDegreeProgram}
                onChange={(e) => setEditedDegreeProgram(e.target.value)}
                className="col-span-3"
                placeholder="e.g. BSIT"
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
              to {editedPresences}, absences to {editedAbsences}, year level to {editedYearLevel || "(none)"}, and
              degree program to {editedDegreeProgram || "(none)"}.
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
                      <TableHead>Year Level</TableHead>
                      <TableHead>Degree Program</TableHead>
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
                        <TableCell>{fine.yearLevel || "-"}</TableCell>
                        <TableCell>{fine.degreeProgram || "-"}</TableCell>
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
                          { label: "Year Level", value: fine.yearLevel || "-" },
                          { label: "Degree Program", value: fine.degreeProgram || "-" },
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
