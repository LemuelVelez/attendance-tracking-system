"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Check,
  Calendar,
  Filter,
  Users,
  Rows,
  Loader2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import {
  getGeneralAttendance,
  createFineDocument,
  getFineDocuments,
  getTotalUniqueEvents,
  getAllUsers,
  deleteFines,
  FineDocument,
  Attendance,
  FineDocumentData,
  User,
} from "@/lib/GeneralAttendance/GeneralAttendance";
import { Checkbox } from "@/components/ui/checkbox";

const PENALTIES_MAP: Record<number, string> = {
  0: "No penalty",
  1: "1 pad grade 1 paper, 1 pencil",
  2: "2 pads Grade 2 paper, 2 pencils, 1 eraser",
  3: "3 Pads Grade 3 paper, 3 pencils, 2 eraser, 1 sharpener",
  4: "2 pads grade 4 paper 2 pencils, 2 ball pen, 1 crayon, 1 sharpener, 1 eraser",
  5: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon",
  6: "2 Pads intermediate paper, 2 notebooks, 2 ball pen, 1 crayon, 2 pencils",
  7: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  8: "1 plastic envelop with handle, 2 Pads intermediate paper, 2 notebooks",
  9: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 2 pencils, 2 eraser, 1 sharpener",
  10: "1 plastic envelop with handle, 2 Pads intermediate paper, 3 notebooks 3 pencils, 2 eraser, 3 sharpener, 3 ball pen, 1 crayon",
};

export default function SupplyFinesManagement() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [fines, setFines] = useState<FineDocument[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("All Events");
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFineId, setSelectedFineId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [isGeneratingFines, setIsGeneratingFines] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const attendanceData = await getGeneralAttendance();
      setAttendances(attendanceData);

      const finesData = await getFineDocuments();
      setFines(finesData);

      const totalEventsCount = await getTotalUniqueEvents();
      setTotalEvents(totalEventsCount);

      const usersData = await getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateFines = useCallback(async () => {
    const userAttendances = attendances.reduce((acc, attendance) => {
      if (
        selectedEvent === "All Events" ||
        attendance.eventName === selectedEvent
      ) {
        acc[attendance.userId] = (acc[attendance.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const newFines: FineDocument[] = [];
    let duplicatesCount = 0;

    for (const user of allUsers) {
      const attended = userAttendances[user.$id] || 0;
      const absences = Math.max(0, totalEvents - attended);
      const presences = attended;

      const penalties = PENALTIES_MAP[absences] || PENALTIES_MAP[10];

      const existingFine = fines.find((fine) => fine.userId === user.$id);
      if (existingFine) {
        console.log(`Fine already exists for user ${user.$id}. Skipping.`);
        duplicatesCount++;
        continue;
      }

      const fineData: FineDocumentData = {
        userId: user.$id,
        studentId: user.studentId,
        name: user.name,
        absences: absences.toString(),
        presences: presences.toString(),
        penalties,
        dateIssued: new Date().toISOString().split("T")[0],
        status: penalties === "No penalty" ? "Cleared" : "Pending",
      };

      try {
        const createdFine = await createFineDocument(fineData);
        newFines.push(createdFine);
      } catch (error) {
        console.error("Error creating fine document:", error);
        duplicatesCount++;
        continue;
      }
    }

    setFines((prevFines) => [...prevFines, ...newFines]);
    return { newFinesCount: newFines.length, duplicatesCount };
  }, [allUsers, attendances, selectedEvent, totalEvents, fines]);

  const handleGenerateFines = async () => {
    setIsGeneratingFines(true);
    try {
      const result = await calculateFines();
      if (result.duplicatesCount > 0) {
        toast({
          title: "Fines Generation Complete",
          description: `Added ${result.newFinesCount} new fines. ${result.duplicatesCount} fines were not added due to existing data.`,
          variant: "default",
          className: "border-yellow-500 text-yellow-700 bg-yellow-50",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully generated ${result.newFinesCount} new fines.`,
        });
      }
    } catch (error) {
      console.error("Error generating fines:", error);
      toast({
        title: "Error",
        description: "Failed to generate fines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFines(false);
      setGenerateDialogOpen(false);
    }
  };

  const handleSubmitSupplies = async (id: string) => {
    try {
      const fineToUpdate = fines.find((fine) => fine.$id === id);
      if (!fineToUpdate) return;

      const updatedFineData: FineDocumentData = {
        userId: fineToUpdate.userId,
        studentId: fineToUpdate.studentId,
        name: fineToUpdate.name,
        absences: fineToUpdate.absences,
        presences: fineToUpdate.presences,
        penalties: fineToUpdate.penalties,
        dateIssued: fineToUpdate.dateIssued,
        status: "Cleared",
        datePaid: new Date().toISOString().split("T")[0],
      };

      const updatedFineDocument = await createFineDocument(updatedFineData);
      setFines((prev) =>
        prev.map((fine) => (fine.$id === id ? updatedFineDocument : fine))
      );
      toast({
        title: "Success",
        description: "Fine has been marked as cleared.",
      });
    } catch (error) {
      console.error("Error updating fine document:", error);
      toast({
        title: "Error",
        description: "Failed to update fine status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFines = async () => {
    setIsDeleting(true);
    try {
      for (const id of selectedFines) {
        await deleteFines(id);
      }
      setFines((prevFines) =>
        prevFines.filter((fine) => !selectedFines.includes(fine.$id))
      );
      setSelectedFines([]);
      toast({
        title: "Success",
        description: `Successfully deleted ${selectedFines.length} fine(s).`,
      });
    } catch (error) {
      console.error("Error deleting fines:", error);
      toast({
        title: "Error",
        description: "Failed to delete fines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const uniqueEvents = [
    "All Events",
    ...new Set(attendances.map((a) => a.eventName)),
  ];

  const filteredFines = fines.filter(
    (fine) =>
      fine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFines.length / rowsPerPage);
  const paginatedFines = filteredFines.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedFines(checked ? paginatedFines.map((fine) => fine.$id) : []);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Attendance Penalties Management
      </h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              Total required events: {totalEvents}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2" />
              Event Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={setSelectedEvent}
              defaultValue={selectedEvent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {uniqueEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Select
              onValueChange={(value) => setRowsPerPage(parseInt(value))}
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

      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" disabled={isGeneratingFines}>
            {isGeneratingFines ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Generate Fines
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Fine Generation</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate fines? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleGenerateFines();
                setGenerateDialogOpen(false);
              }}
              disabled={isGeneratingFines}
            >
              {isGeneratingFines ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={selectedFines.length === 0 || isDeleting}
            >
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
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedFines.length} selected
                fine(s)? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteFines}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Rows className="w-6 h-6 mr-2" />
            Required Supplies List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table view for large devices */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
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
                {paginatedFines.map((fine) => {
                  const presences =
                    selectedEvent === "All Events"
                      ? parseInt(fine.presences)
                      : attendances.filter(
                          (a) =>
                            a.userId === fine.userId &&
                            a.eventName === selectedEvent
                        ).length;

                  return (
                    <TableRow key={fine.$id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFines.includes(fine.$id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFines([...selectedFines, fine.$id]);
                            } else {
                              setSelectedFines(
                                selectedFines.filter((id) => id !== fine.$id)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{fine.studentId}</TableCell>
                      <TableCell>{fine.name}</TableCell>
                      <TableCell>{presences}</TableCell>
                      <TableCell>{fine.absences}</TableCell>
                      <TableCell>{fine.penalties}</TableCell>
                      <TableCell>{fine.dateIssued}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            fine.status === "Cleared" ? "secondary" : "outline"
                          }
                          className={
                            fine.status === "Cleared"
                              ? "bg-green-500 text-white"
                              : ""
                          }
                        >
                          {fine.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fine.status === "Pending" ? (
                          <Dialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedFineId(fine.$id)}
                                size="sm"
                              >
                                Mark as Cleared
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Action</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to mark this fine as
                                  cleared?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (selectedFineId) {
                                      handleSubmitSupplies(selectedFineId);
                                      setDialogOpen(false);
                                    }
                                  }}
                                >
                                  Confirm
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            Cleared
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Card view for small devices */}
          <div className="md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                <span className="mr-2 ">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </span>
                Select All
              </span>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {paginatedFines.map((fine) => {
                const presences =
                  selectedEvent === "All Events"
                    ? parseInt(fine.presences)
                    : attendances.filter(
                        (a) =>
                          a.userId === fine.userId &&
                          a.eventName === selectedEvent
                      ).length;

                return (
                  <Card key={fine.$id} className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="col-span-2 flex items-center justify-between">
                        <Checkbox
                          checked={selectedFines.includes(fine.$id)}
                          onCheckedChange={(checked) => {
                            setSelectedFines((prev) =>
                              checked
                                ? [...prev, fine.$id]
                                : prev.filter((id) => id !== fine.$id)
                            );
                          }}
                        />
                        <Badge
                          variant={
                            fine.status === "Cleared" ? "secondary" : "outline"
                          }
                          className={`text-xs ${
                            fine.status === "Cleared"
                              ? "bg-green-500 text-white"
                              : ""
                          }`}
                        >
                          {fine.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-semibold">Student ID:</p>
                        <p className="truncate">{fine.studentId}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Name:</p>
                        <p className="truncate">{fine.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Presences:</p>
                        <p>{presences}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Absences:</p>
                        <p>{fine.absences}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">Required Supplies:</p>
                        <p className="text-xs">{fine.penalties}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Date Issued:</p>
                        <p className="text-xs">{fine.dateIssued}</p>
                      </div>
                      <div className="col-span-2 mt-2">
                        {fine.status === "Pending" ? (
                          <Dialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedFineId(fine.$id)}
                                size="sm"
                                className="w-full text-xs"
                              >
                                Mark as Cleared
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirm Action</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to mark this fine as
                                  cleared?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (selectedFineId) {
                                      handleSubmitSupplies(selectedFineId);
                                      setDialogOpen(false);
                                    }
                                  }}
                                >
                                  Confirm
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-green-600 w-full justify-center text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Cleared
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left w-full sm:w-auto">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredFines.length)} of{" "}
              {filteredFines.length} entries
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
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
  );
}
