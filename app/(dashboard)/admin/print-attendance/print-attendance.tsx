"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
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

  const handleDownloadPDF = () => {
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
      doc.text("Academic Year 2023-2024", width / 2, titleY + 8, {
        align: "center",
      });

      // Event Details
      const eventDetailsY = titleY + 20;
      doc.setFontSize(10);
      doc.text(`Event: ${selectedEvent}`, 14, eventDetailsY);
      doc.text("Venue: JRMSU Gymnasium", 14, eventDetailsY + 6);
      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        width - 14,
        eventDetailsY,
        {
          align: "right",
        }
      );
      doc.text(
        `Time: ${new Date().toLocaleTimeString()}`,
        width - 14,
        eventDetailsY + 6,
        {
          align: "right",
        }
      );

      return eventDetailsY + 15;
    };

    const tableColumn = [
      "Name",
      "Student ID",
      "Date",
      "Time",
      "Program",
      "Year",
      "Section",
    ];

    const tableRows = Array.from(selectedRows).map((index) => {
      const record = filteredData[index];
      return [
        record.name,
        record.studentId,
        record.date,
        record.time,
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
      ((doc as unknown) as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? 150;
    const signatureY = Math.min(finalY + 40, height - 30);
    doc.text("Prepared by:", width * 0.25, signatureY, { align: "center" });
    doc.text("SSG Secretary", width * 0.25, signatureY + 5, {
      align: "center",
    });
    doc.line(width * 0.1, signatureY - 5, width * 0.4, signatureY - 5);

    doc.text("Noted by:", width * 0.75, signatureY, { align: "center" });
    doc.text("SSG Adviser", width * 0.75, signatureY + 5, { align: "center" });
    doc.line(width * 0.6, signatureY - 5, width * 0.9, signatureY - 5);

    doc.save("attendance_record.pdf");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[8.5in] mx-auto my-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Attendance Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select
                defaultValue="general"
                onValueChange={(value) =>
                  setAttendanceType(value as AttendanceType)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue defaultValue="general" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Attendance</SelectItem>
                  <SelectItem value="college">College Attendance</SelectItem>
                </SelectContent>
              </Select>
              {attendanceType === "college" && (
                <Select
                  onValueChange={(value) =>
                    setCollegeType(value as CollegeType)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
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
            </div>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="paper-size">Paper Size</Label>
            <RadioGroup
              id="paper-size"
              defaultValue="letter"
              className="flex space-x-4 mt-2"
              onValueChange={handlePaperSizeChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="letter" id="letter" />
                <Label htmlFor="letter">Letter (&quot;8.5 x 11&quot;)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legal" id="legal" />
                <Label htmlFor="legal">Legal (&quot;8.5 x 14&quot;)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4">A4 (210mm x 297mm)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedRows.size === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Degree Program</TableHead>
                  <TableHead>Year Level</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onCheckedChange={() => handleRowSelect(index)}
                      />
                    </TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.studentId}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.degreeProgram}</TableCell>
                    <TableCell>{record.yearLevel}</TableCell>
                    <TableCell>{record.section}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      {selectedRows.size > 0 && (
        <Card className="w-full bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
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
              <h1 className="text-2xl font-bold">ATTENDANCE RECORD</h1>
              <p className="text-sm text-gray-600">Academic Year 2023-2024</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p>
                    <span className="font-semibold">Event:</span>{" "}
                    {selectedEvent}
                  </p>
                  <p>
                    <span className="font-semibold">Venue:</span>{" "}
                    {Array.from(selectedRows)[0] !== undefined
                      ? filteredData[Array.from(selectedRows)[0]].location ||
                        "JRMSU Gymnasium"
                      : "JRMSU Gymnasium"}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date().toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Section</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(selectedRows).map((index) => {
                    const record = filteredData[index];
                    return (
                      <TableRow key={index}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.studentId}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>{record.degreeProgram}</TableCell>
                        <TableCell>{record.yearLevel}</TableCell>
                        <TableCell>{record.section}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-16"></div>
                  <p className="font-semibold">Prepared by</p>
                  <p className="text-sm text-gray-600">SSG Secretary</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mt-16"></div>
                  <p className="font-semibold">Noted by</p>
                  <p className="text-sm text-gray-600">SSG Adviser</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
