"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  getAgricultureAndForestryAttendance,
  getArtsAndSciencesAttendance,
  getBusinessAdministrationAttendance,
  getComputingStudiesAttendance,
  getCriminalJusticeEducationAttendance,
  getEngineeringAttendance,
  getTeacherEducationAttendance,
} from "@/lib/GeneralAttendance/getCollegeAttendance";
import { getGeneralAttendance } from "@/lib/GeneralAttendance/GeneralAttendance";
import {
  AttendanceType,
  CollegeType,
  AttendanceRecord,
} from "@/lib/GeneralAttendance/getCollegeAttendance";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY: number;
  margin?: { left: number; right: number };
  didDrawPage?: (data: { pageNumber: number; cursor: { y: number } }) => void;
}

interface ExtendedAttendanceRecord extends AttendanceRecord {
  degreeProgram: string;
  yearLevel: string;
  section: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
      <span className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} entries
      </span>
      <nav
        className="flex items-center justify-center space-x-2"
        aria-label="Pagination"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600 hidden sm:inline">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};

const collegeAttendanceFunctions: Record<
  CollegeType,
  () => Promise<ExtendedAttendanceRecord[]>
> = {
  ComputingStudies: async () => {
    const data = await getComputingStudiesAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Computer Science",
      yearLevel: record.yearLevel || "3rd Year",
      section: record.section || "A",
    }));
  },
  AgricultureAndForestry: async () => {
    const data = await getAgricultureAndForestryAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Agriculture",
      yearLevel: record.yearLevel || "2nd Year",
      section: record.section || "B",
    }));
  },
  ArtsAndSciences: async () => {
    const data = await getArtsAndSciencesAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Biology",
      yearLevel: record.yearLevel || "4th Year",
      section: record.section || "C",
    }));
  },
  BusinessAdministration: async () => {
    const data = await getBusinessAdministrationAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Business Administration",
      yearLevel: record.yearLevel || "1st Year",
      section: record.section || "D",
    }));
  },
  CriminalJusticeEducation: async () => {
    const data = await getCriminalJusticeEducationAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Criminology",
      yearLevel: record.yearLevel || "2nd Year",
      section: record.section || "E",
    }));
  },
  Engineering: async () => {
    const data = await getEngineeringAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BS in Civil Engineering",
      yearLevel: record.yearLevel || "3rd Year",
      section: record.section || "F",
    }));
  },
  TeacherEducation: async () => {
    const data = await getTeacherEducationAttendance();
    return data.map((record) => ({
      ...record,
      degreeProgram: record.degreeProgram || "BSED",
      yearLevel: record.yearLevel || "4th Year",
      section: record.section || "G",
    }));
  },
};

function convertTo12HourFormat(time24: string): string {
  const [hour, minute] = time24.split(":");
  const hour12 = parseInt(hour, 10) % 12 || 12;
  const ampm = parseInt(hour, 10) >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

export default function PrintableAttendanceDocument() {
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(
    "general"
  );
  const [collegeType, setCollegeType] = useState<CollegeType>(
    "ComputingStudies"
  );
  const [attendanceData, setAttendanceData] = useState<
    ExtendedAttendanceRecord[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [paperSize, setPaperSize] = useState("letter");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<string[]>([
    "2023-2024",
    "2024-2025",
    "2025-2026",
  ]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2024-2025");
  const [newAcademicYear, setNewAcademicYear] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        let data: ExtendedAttendanceRecord[];
        if (attendanceType === "general") {
          data = await getGeneralAttendance();
        } else {
          data = await collegeAttendanceFunctions[collegeType]();
        }
        setAttendanceData(data);
        const events = Array.from(
          new Set(data.map((record) => record.eventName))
        );
        setAvailableEvents(events);
        setSelectedEvent(events[0] || "");
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchAttendanceData();
  }, [attendanceType, collegeType, toast]);

  const getItemsPerPage = (size: string) => {
    switch (size) {
      case "letter":
        return 10;
      case "legal":
        return 15;
      case "a4":
        return 12;
      default:
        return 10;
    }
  };

  useEffect(() => {
    setItemsPerPage(getItemsPerPage(paperSize));
    setCurrentPage(1);
  }, [paperSize]);

  const handleRowSelect = (index: number) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const filteredData = attendanceData.filter(
    (record) =>
      record.eventName === selectedEvent &&
      Object.values(record).some((value) =>
        value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePaperSizeChange = (value: string) => {
    setPaperSize(value);
  };

  const handleAddAcademicYear = useCallback(() => {
    if (newAcademicYear && !academicYears.includes(newAcademicYear)) {
      setAcademicYears((prev) => [...prev, newAcademicYear]);
      setSelectedAcademicYear(newAcademicYear);
      setNewAcademicYear("");
      toast({
        title: "Academic Year Added",
        description: `Successfully added ${newAcademicYear} to the list of academic years.`,
      });
    }
  }, [newAcademicYear, academicYears, toast]);

  const handleDownloadPDF = async () => {
    try {
      const paperSizes = {
        letter: [215.9, 279.4],
        legal: [215.9, 355.6],
        a4: [210, 297],
      };
      const [width, height] = paperSizes[paperSize as keyof typeof paperSizes];

      const doc = new jsPDF({
        unit: "mm",
        format: [width, height],
      });

      const generatePage = (pageNumber: number) => {
        doc.setPage(pageNumber);

        // Header
        const headerHeight = height * 0.1;
        doc.addImage("/Header.png", "PNG", 10, 10, width - 20, headerHeight);

        // Document Title
        const titleY = headerHeight + 20;
        doc.setFontSize(18);
        doc.text("ATTENDANCE RECORD", width / 2, titleY, { align: "center" });
        doc.setFontSize(12);
        doc.text(
          `Academic Year ${selectedAcademicYear}`,
          width / 2,
          titleY + 8,
          {
            align: "center",
          }
        );

        // Event Details
        const eventDetailsY = titleY + 20;
        doc.setFontSize(10);
        doc.text(`Event: ${selectedEvent}`, 14, eventDetailsY);
        doc.text("Venue: JRMSU Gymnasium", 14, eventDetailsY + 6);

        // Use the date and time from the first selected record
        const firstSelectedRecord = filteredData[Array.from(selectedRows)[0]];
        if (firstSelectedRecord) {
          doc.text(
            `Date: ${formatDate(firstSelectedRecord.date)}`,
            width - 14,
            eventDetailsY,
            { align: "right" }
          );
          doc.text(
            `Time: ${convertTo12HourFormat(firstSelectedRecord.time)}`,
            width - 14,
            eventDetailsY + 6,
            { align: "right" }
          );
        }

        return eventDetailsY + 15;
      };

      const tableColumn = ["Name", "Student ID", "Program", "Year", "Section"];

      const tableRows = Array.from(selectedRows).map((index) => {
        const record = filteredData[index];
        return [
          record.name,
          record.studentId,
          record.degreeProgram,
          record.yearLevel,
          record.section,
        ];
      });

      let startY = generatePage(1);
      let pageNumber = 1;

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          if (data.pageNumber > pageNumber) {
            pageNumber = data.pageNumber;
            startY = generatePage(pageNumber);
            data.cursor.y = startY;
          }
        },
      });

      // Signature Section (only on the last page)
      const finalY =
        ((doc as unknown) as { lastAutoTable?: { finalY: number } })
          .lastAutoTable?.finalY ?? 150;
      const signatureY = Math.min(finalY + 40, height - 30);
      doc.text("Prepared by:", width * 0.25, signatureY, { align: "center" });
      doc.text("SSG Secretary", width * 0.25, signatureY + 5, {
        align: "center",
      });
      doc.line(width * 0.1, signatureY - 5, width * 0.4, signatureY - 5);

      doc.text("Noted by:", width * 0.75, signatureY, { align: "center" });
      doc.text("SSG Adviser", width * 0.75, signatureY + 5, {
        align: "center",
      });
      doc.line(width * 0.6, signatureY - 5, width * 0.9, signatureY - 5);

      doc.save("attendance_record.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-6xl shadow-md rounded-lg p-4">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-xl sm:text-3xl font-bold text-center">
            Attendance Record
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <Select
              defaultValue="general"
              onValueChange={(value) =>
                setAttendanceType(value as AttendanceType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select attendance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Attendance</SelectItem>
                <SelectItem value="college">College Attendance</SelectItem>
              </SelectContent>
            </Select>
            {attendanceType === "college" && (
              <Select
                onValueChange={(value) => setCollegeType(value as CollegeType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ComputingStudies">
                    Computing Studies
                  </SelectItem>
                  <SelectItem value="AgricultureAndForestry">
                    Agriculture and Forestry
                  </SelectItem>
                  <SelectItem value="ArtsAndSciences">
                    Arts and Sciences
                  </SelectItem>
                  <SelectItem value="BusinessAdministration">
                    Business Administration
                  </SelectItem>
                  <SelectItem value="CriminalJusticeEducation">
                    Criminal Justice Education
                  </SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="TeacherEducation">
                    Teacher Education
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedAcademicYear}
              onValueChange={(value) => {
                setSelectedAcademicYear(value);
                toast({
                  title: "Academic Year Changed",
                  description: `Successfully changed the academic year to ${value}.`,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Input
              placeholder="Add new academic year (e.g., 2026-2027)"
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddAcademicYear} size="icon">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search records"
            />
          </div>
          <div className="mb-6 text:xs sm:text-base">
            <Label htmlFor="paper-size" className="mb-4 block">
              Paper Size
            </Label>
            <RadioGroup
              id="paper-size"
              defaultValue="letter"
              className="flex flex-wrap gap-4"
              onValueChange={handlePaperSizeChange}
            >
              <div className="flex items-center space-x-2 text:xs sm:text-base">
                <RadioGroupItem value="letter" id="letter" />
                <Label htmlFor="letter">Letter (&quot;8.5 x 11&quot;)</Label>
              </div>
              <div className="flex items-center space-x-2 text:xs sm:text-base">
                <RadioGroupItem value="legal" id="legal" />
                <Label htmlFor="legal">Legal (&quot;8.5 x 14&quot;)</Label>
              </div>
              <div className="flex items-center space-x-2 text:xs sm:text-base">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4">A4 (210mm x 297mm)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between my-4 ">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[95px]">
                <SelectValue placeholder="Select number of rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="1000">1000 rows</SelectItem>
              </SelectContent>
            </Select>
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
                <TableRow>
                  <TableHead className="w-[50px] text-xs sm:text-base">
                    <Checkbox
                      checked={
                        selectedRows.size === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs sm:text-base">Name</TableHead>
                  <TableHead className="text-xs sm:text-base">
                    Student ID
                  </TableHead>
                  <TableHead className="text-xs sm:text-base">
                    Degree Program
                  </TableHead>
                  <TableHead className="text-xs sm:text-base">
                    Year Level
                  </TableHead>
                  <TableHead className="text-xs sm:text-base">
                    Section
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs sm:text-base">
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onCheckedChange={() => handleRowSelect(index)}
                      />
                    </TableCell>
                    <TableCell className="text-xs sm:text-base">
                      {record.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-base">
                      {record.studentId}
                    </TableCell>
                    <TableCell className="text-xs sm:text-base">
                      {record.degreeProgram}
                    </TableCell>
                    <TableCell className="text-xs sm:text-base">
                      {record.yearLevel}
                    </TableCell>
                    <TableCell className="text-xs sm:text-base">
                      {record.section}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
            />
          </div>
        </CardContent>
        <footer className="py-4 text-center">
          <p className="text-sm">JESUS BE ALL THE GLORY!</p>
          <p className="text-xs mt-1">© SSG QR Attendance</p>
        </footer>
      </Card>

      {selectedRows.size > 0 && (
        <Card className="mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-6xl bg-white shadow-md rounded-lg p-4">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                <span>Download PDF</span>
              </Button>
            </div>
            <div className="w-full mb-6">
              <Image
                src="/Header.png"
                alt="JRMSU Header"
                width={1200}
                height={200}
                className="w-full object-contain"
              />
            </div>
            <div className="text-center mb-8">
              <h1 className="text-base sm:text-3xl font-bold text-gray-950">
                ATTENDANCE RECORD
              </h1>
              <p className="text-xs sm:text-xl text-gray-600">
                Academic Year {selectedAcademicYear}
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs sm:text-base text-gray-950">
                    <span className="font-semibold">Event:</span>{" "}
                    {selectedEvent}
                  </p>
                  <p className="text-xs sm:text-base text-gray-950">
                    <span className="font-semibold">Venue:</span>{" "}
                    {Array.from(selectedRows)[0] !== undefined
                      ? filteredData[Array.from(selectedRows)[0]].location ||
                        "JRMSU Gymnasium"
                      : "JRMSU Gymnasium"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-base text-gray-950">
                    <span className="font-semibold">Date:</span>{" "}
                    {Array.from(selectedRows)[0] !== undefined
                      ? formatDate(
                          filteredData[Array.from(selectedRows)[0]].date
                        )
                      : ""}
                  </p>
                  <p className="text-xs sm:text-base text-gray-950">
                    <span className="font-semibold">Time:</span>{" "}
                    {Array.from(selectedRows)[0] !== undefined
                      ? convertTo12HourFormat(
                          filteredData[Array.from(selectedRows)[0]].time
                        )
                      : ""}
                  </p>
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
                    <TableRow>
                      <TableHead className="text-xs sm:text-base">
                        Name
                      </TableHead>
                      <TableHead className="text-xs sm:text-base">
                        Student ID
                      </TableHead>
                      <TableHead className="text-xs sm:text-base">
                        Program
                      </TableHead>
                      <TableHead className="text-xs sm:text-base">
                        Year
                      </TableHead>
                      <TableHead className="text-xs sm:text-base">
                        Section
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(selectedRows).map((index) => {
                      const record = filteredData[index];
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-xs sm:text-base text-gray-950">
                            {record.name}
                          </TableCell>
                          <TableCell className="text-xs sm:text-base text-gray-950">
                            {record.studentId}
                          </TableCell>
                          <TableCell className="text-xs sm:text-base text-gray-950">
                            {record.degreeProgram}
                          </TableCell>
                          <TableCell className="text-xs sm:text-base text-gray-950">
                            {record.yearLevel}
                          </TableCell>
                          <TableCell className="text-xs sm:text-base text-gray-950">
                            {record.section}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <div className="border-t border-black w-36 sm:w-48 mx-auto mt-12 sm:mt-16"></div>
                  <p className="font-semibold text-sm sm:text-base text-gray-950">
                    Prepared by
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    SSG Secretary
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-36 sm:w-48 mx-auto mt-12 sm:mt-16"></div>
                  <p className="font-semibold text-sm sm:text-base text-gray-950">
                    Noted by
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    SSG Adviser
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
