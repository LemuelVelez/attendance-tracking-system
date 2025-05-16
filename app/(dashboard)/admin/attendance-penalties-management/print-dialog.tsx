"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { PrintableTable } from "@/components/PrintableTable"
import { Loader2, Filter, Eye } from "lucide-react"
import type { FineDocument } from "@/lib/GeneralAttendance/GeneralAttendance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PrintDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    fines: FineDocument[]
    yearLevels: string[]
    degreePrograms: string[]
    selectedFines?: FineDocument[] // Add this prop to accept selected fines
    printSelectedOnly?: boolean // Add this prop to control printing selected only
}

// Update the PrintDialog component to include tabs for better organization
export const PrintDialog: React.FC<PrintDialogProps> = ({
    open,
    onOpenChange,
    fines,
    yearLevels,
    degreePrograms,
    selectedFines = [],
    printSelectedOnly = false,
}) => {
    const [title, setTitle] = useState("Attendance Penalties Report")
    const [absencesThreshold, setAbsencesThreshold] = useState("4")
    const [selectedYearLevels, setSelectedYearLevels] = useState<string[]>([])
    const [selectedDegreePrograms, setSelectedDegreePrograms] = useState<string[]>([])
    const [showPrintableTable, setShowPrintableTable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<"configure" | "preview">("configure")

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setShowPrintableTable(false)
            setIsLoading(false)
            setActiveTab("configure")

            // If printing selected only, set a more appropriate title
            if (printSelectedOnly && selectedFines.length > 0) {
                setTitle(`Selected Students (${selectedFines.length}) - Attendance Penalties Report`)
            } else {
                setTitle("Attendance Penalties Report")
            }
        }
    }, [open, printSelectedOnly, selectedFines])

    const handleYearLevelChange = (yearLevel: string, checked: boolean) => {
        if (checked) {
            setSelectedYearLevels((prev) => [...prev, yearLevel])
        } else {
            setSelectedYearLevels((prev) => prev.filter((yl) => yl !== yearLevel))
        }
    }

    const handleDegreeProgramChange = (program: string, checked: boolean) => {
        if (checked) {
            setSelectedDegreePrograms((prev) => [...prev, program])
        } else {
            setSelectedDegreePrograms((prev) => prev.filter((dp) => dp !== program))
        }
    }

    const handleGenerateReport = () => {
        setIsLoading(true)
        // Short timeout to allow the UI to update before showing the table
        setTimeout(() => {
            setShowPrintableTable(true)
            setIsLoading(false)
            setActiveTab("preview")
        }, 500)
    }

    // Determine which data to use based on printSelectedOnly flag
    const dataToUse = printSelectedOnly && selectedFines.length > 0 ? selectedFines : fines

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>{printSelectedOnly ? "Print Selected Students" : "Print Fines Table"}</AlertDialogTitle>
                    <AlertDialogDescription className="text-black">
                        {printSelectedOnly
                            ? `Print the selected ${selectedFines.length} student(s)`
                            : "Customize the fines table report, preview, and download it"}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "configure" | "preview")}
                    className="mt-4"
                >
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
                        <TabsTrigger value="configure">Configure Report</TabsTrigger>
                        <TabsTrigger value="preview" disabled={!showPrintableTable} className="hidden md:block">
                            Preview & Download
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="configure" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="report-title">Report Title</Label>
                            <Input
                                id="report-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a title for your report"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="absences-threshold">Absences Threshold</Label>
                            <Input
                                id="absences-threshold"
                                type="number"
                                min="0"
                                value={absencesThreshold}
                                onChange={(e) => setAbsencesThreshold(e.target.value)}
                                placeholder="Show students with absences at or above this number"
                            />
                            <p className="text-sm text-black">Only show students with at least this many absences</p>
                        </div>

                        {/* Only show filters for Print Fines Table, not for Print Selected */}
                        {!printSelectedOnly && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Filter by Year Level</Label>
                                    <Card>
                                        <CardContent className="pt-4 max-h-[200px] overflow-y-auto">
                                            {yearLevels.length > 0 ? (
                                                yearLevels.map((yearLevel) => (
                                                    <div key={yearLevel} className="flex items-center space-x-2 mb-2">
                                                        <Checkbox
                                                            id={`year-level-${yearLevel}`}
                                                            checked={selectedYearLevels.includes(yearLevel)}
                                                            onCheckedChange={(checked) => handleYearLevelChange(yearLevel, !!checked)}
                                                        />
                                                        <Label htmlFor={`year-level-${yearLevel}`} className="cursor-pointer">
                                                            {yearLevel}
                                                        </Label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-black">No year levels available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <p className="text-sm text-black">Leave all unchecked to include all year levels</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Filter by Degree Program</Label>
                                    <Card>
                                        <CardContent className="pt-4 max-h-[200px] overflow-y-auto">
                                            {degreePrograms.length > 0 ? (
                                                degreePrograms.map((program) => (
                                                    <div key={program} className="flex items-center space-x-2 mb-2">
                                                        <Checkbox
                                                            id={`program-${program}`}
                                                            checked={selectedDegreePrograms.includes(program)}
                                                            onCheckedChange={(checked) => handleDegreeProgramChange(program, !!checked)}
                                                        />
                                                        <Label htmlFor={`program-${program}`} className="cursor-pointer">
                                                            {program}
                                                        </Label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-black">No degree programs available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <p className="text-sm text-black">Leave all unchecked to include all degree programs</p>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Generate Report
                                </>
                            )}
                        </Button>

                        {/* Mobile-only download button */}
                        {showPrintableTable && (
                            <Button onClick={() => window.print()} className="w-full md:hidden mt-4">
                                Download PDF
                            </Button>
                        )}
                    </TabsContent>

                    <TabsContent value="preview" className="pt-4">
                        {showPrintableTable ? (
                            <div className="border rounded-md p-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Button onClick={() => setActiveTab("configure")} variant="outline" size="sm">
                                        Back to Configuration
                                    </Button>
                                </div>
                                <PrintableTable
                                    data={dataToUse}
                                    title={title}
                                    absencesThreshold={Number.parseInt(absencesThreshold) || 0}
                                    yearLevels={printSelectedOnly ? [] : selectedYearLevels}
                                    degreePrograms={printSelectedOnly ? [] : selectedDegreePrograms}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Eye className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-xl font-semibold mb-2">No Preview Available</p>
                                <p className="text-black mb-4">Please generate a report first to preview and download it.</p>
                                <Button onClick={() => setActiveTab("configure")}>Configure Report</Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
