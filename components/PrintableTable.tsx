"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Eye, Download, FileText } from "lucide-react"
import type { FineDocument } from "@/lib/GeneralAttendance/GeneralAttendance"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

interface PrintableTableProps {
    data: FineDocument[]
    title: string
    absencesThreshold: number
    yearLevels: string[]
    degreePrograms: string[]
}

export const PrintableTable: React.FC<PrintableTableProps> = ({
    data,
    title,
    absencesThreshold,
    yearLevels,
    degreePrograms,
}) => {
    const printRef = useRef<HTMLDivElement>(null)
    const [previewOpen, setPreviewOpen] = useState(false)

    // Filter data based on criteria
    const filteredData = data.filter((item) => {
        const absences = Number.parseInt(item.absences)
        const matchesAbsences = absences >= absencesThreshold
        const matchesYearLevel = yearLevels.length === 0 || yearLevels.includes(item.yearLevel || "")
        const matchesDegreeProgram = degreePrograms.length === 0 || degreePrograms.includes(item.degreeProgram || "")

        return matchesAbsences && matchesYearLevel && matchesDegreeProgram
    })

    // Generate HTML content for printing and downloading
    const generatePrintContent = () => {
        // Create a table HTML string manually
        let tableHtml = ""

        if (filteredData.length > 0) {
            tableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #000;">
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Student ID</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Name</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Year Level</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Degree Program</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Absences</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Penalties</th>
            </tr>
          </thead>
          <tbody>
      `

            filteredData.forEach((item) => {
                tableHtml += `
          <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.studentId}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.name}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.yearLevel || "-"}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.degreeProgram || "-"}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.absences}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">${item.penalties}</td>
          </tr>
        `
            })

            tableHtml += `
          </tbody>
        </table>
      `
        } else {
            tableHtml = `<div style="text-align: center; padding: 20px; font-style: italic; color: black;">No records match the selected criteria</div>`
        }

        // Create filter information text - only include absences threshold
        const filterInfo = `Absences Threshold: ${absencesThreshold}`

        const currentDate = new Date()
        const formattedDate = `${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: black;
              background-color: white;
              line-height: 1.4;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              border: 1px solid #000;
              table-layout: fixed;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            h1 { 
              text-align: center; 
              margin-bottom: 10px;
              color: black;
              font-size: 18px;
              font-weight: bold;
            }
            .filter-info {
              text-align: center;
              margin-bottom: 20px;
              font-size: 14px;
              color: #000;
            }
            .no-data { 
              text-align: center; 
              padding: 20px; 
              font-style: italic;
              color: black;
            }
            .footer {
              text-align: center; 
              margin-top: 30px; 
              font-size: 12px;
              color: black;
            }
            .date-header {
              text-align: right;
              font-size: 12px;
              margin-bottom: 10px;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                background-color: white;
                color: black;
              }
              table, th, td {
                border-color: #000 !important;
                color: black !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="date-header">${formattedDate}</div>
          <h1>${title}</h1>
          <div class="filter-info">${filterInfo}</div>
          ${tableHtml}
          <div class="footer">
            <p>JESUS BE ALL THE GLORY!</p>
            <p>© SSG QR Attendance</p>
            <p>Generated on ${formattedDate}</p>
          </div>
        </body>
      </html>
    `
    }

    const handlePrint = () => {
        try {
            // Create a new iframe
            const iframe = document.createElement("iframe")
            iframe.style.position = "absolute"
            iframe.style.top = "-9999px"
            iframe.style.left = "-9999px"
            iframe.style.width = "0"
            iframe.style.height = "0"
            document.body.appendChild(iframe)

            // Wait for iframe to be loaded before writing content
            iframe.onload = () => {
                try {
                    // Get the iframe's document
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

                    if (!iframeDoc) {
                        throw new Error("Could not access iframe document")
                    }

                    // Write the print content to the iframe
                    iframeDoc.open()
                    iframeDoc.write(generatePrintContent())
                    iframeDoc.close()

                    // Wait a moment for styles to apply
                    setTimeout(() => {
                        try {
                            // Focus the iframe window
                            iframe.contentWindow?.focus()
                            // Print the iframe
                            iframe.contentWindow?.print()

                            // Remove the iframe after printing (or after a timeout)
                            setTimeout(() => {
                                document.body.removeChild(iframe)
                            }, 1000)
                        } catch (printError) {
                            console.error("Error during print operation:", printError)
                            alert("There was an error while printing. Please try again or use the Download option.")
                            document.body.removeChild(iframe)
                        }
                    }, 500)
                } catch (docError) {
                    console.error("Error accessing iframe document:", docError)
                    alert("There was an error preparing the print view. Please try again or use the Download option.")
                    document.body.removeChild(iframe)
                }
            }

            // Handle iframe load errors
            iframe.onerror = () => {
                console.error("Error loading iframe")
                alert("There was an error preparing the print view. Please try again or use the Download option.")
                document.body.removeChild(iframe)
            }
        } catch (error) {
            console.error("Error creating print iframe:", error)
            alert("There was an error preparing the print view. Please try again or use the Download option.")
        }
    }

    const handleDownload = () => {
        const printContent = generatePrintContent()

        // Create a Blob with the HTML content
        const blob = new Blob([printContent], { type: "text/html" })

        // Create a download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`
        document.body.appendChild(a)
        a.click()

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }, 100)
    }

    const handleDownloadPDF = async () => {
        try {
            // Use a different approach with jsPDF directly
            const { default: JsPDF } = await import("jspdf")

            // Create a new PDF document
            const pdf = new JsPDF("p", "mm", "a4")
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 15

            // Current date and time - format more compactly
            const currentDate = new Date()
            const dateStr = currentDate.toLocaleDateString()

            // Add date in top right - position it better to avoid cutoff
            pdf.setFontSize(9)
            pdf.setTextColor(0, 0, 0)
            pdf.text(dateStr, pageWidth - margin - 2, margin, { align: "right" })

            // Add title
            pdf.setFontSize(16)
            pdf.setFont("helvetica", "bold")
            pdf.text(title, pageWidth / 2, margin + 10, { align: "center" })

            // Add filter info - only absences threshold
            pdf.setFontSize(12)
            pdf.setFont("helvetica", "normal")
            const filterInfo = `Absences Threshold: ${absencesThreshold}`
            pdf.text(filterInfo, pageWidth / 2, margin + 18, { align: "center" })

            // If no data, show message
            if (filteredData.length === 0) {
                pdf.setFontSize(12)
                pdf.text("No records match the selected criteria", pageWidth / 2, margin + 30, { align: "center" })
            } else {
                // Define table structure
                const headers = ["Student ID", "Name", "Year Level", "Degree Program", "Absences", "Penalties"]

                // Calculate column widths based on content - adjusted for better proportions
                const columnWidths = [28, 30, 25, 30, 20, 52]
                const startY = margin + 25

                // Draw table header
                pdf.setFillColor(240, 240, 240)
                pdf.setDrawColor(0, 0, 0)
                pdf.setLineWidth(0.1)

                let xPos = margin
                let yPos = startY

                // Draw header cells
                headers.forEach((header, i) => {
                    pdf.setFillColor(240, 240, 240)
                    pdf.rect(xPos, yPos, columnWidths[i], 10, "FD")
                    pdf.setFont("helvetica", "bold")
                    pdf.setFontSize(10)

                    // Center the header text within the cell
                    const textWidth = pdf.getStringUnitWidth(header) * 10 * 0.352778 // Convert to mm
                    const xOffset = (columnWidths[i] - textWidth) / 2
                    pdf.text(header, xPos + Math.max(2, xOffset), yPos + 6)

                    xPos += columnWidths[i]
                })

                yPos += 10

                // Draw table rows
                pdf.setFont("helvetica", "normal")
                pdf.setFontSize(9) // Slightly smaller font for content

                for (const item of filteredData) {
                    // Process each cell's content to ensure proper wrapping
                    const cellContents = [
                        item.studentId,
                        item.name,
                        item.yearLevel || "-",
                        item.degreeProgram || "-",
                        item.absences,
                        item.penalties,
                    ]

                    // Split each cell's content into lines that fit within the cell width
                    const cellLines = cellContents.map((content, i) => {
                        const maxWidth = columnWidths[i] - 4 // Subtract padding
                        return pdf.splitTextToSize(content.toString(), maxWidth)
                    })

                    // Calculate the maximum number of lines in any cell for this row
                    const maxLines = Math.max(...cellLines.map((lines) => lines.length))

                    // Calculate row height based on number of lines (minimum 10mm)
                    const lineHeight = 4 // Reduced for more compact text
                    const rowHeight = Math.max(10, (maxLines + 0.5) * lineHeight)

                    // Check if we need a new page
                    if (yPos + rowHeight > pageHeight - 30) {
                        // Add footer to current page
                        addFooter(pdf, pageWidth, pageHeight, dateStr)

                        // Add new page
                        pdf.addPage()
                        yPos = margin

                        // Redraw header on new page
                        xPos = margin
                        headers.forEach((header, i) => {
                            pdf.setFillColor(240, 240, 240)
                            pdf.rect(xPos, yPos, columnWidths[i], 10, "FD")
                            pdf.setFont("helvetica", "bold")
                            pdf.setFontSize(10)

                            // Center the header text within the cell
                            const textWidth = pdf.getStringUnitWidth(header) * 10 * 0.352778 // Convert to mm
                            const xOffset = (columnWidths[i] - textWidth) / 2
                            pdf.text(header, xPos + Math.max(2, xOffset), yPos + 6)

                            xPos += columnWidths[i]
                        })

                        yPos += 10
                        pdf.setFont("helvetica", "normal")
                        pdf.setFontSize(9)
                    }

                    // Draw row background
                    pdf.setFillColor(255, 255, 255)
                    pdf.rect(
                        margin,
                        yPos,
                        columnWidths.reduce((a, b) => a + b, 0),
                        rowHeight,
                        "FD",
                    )

                    // Draw cell borders and content
                    xPos = margin

                    // Draw each cell with its content
                    cellLines.forEach((lines, i) => {
                        // Draw cell border
                        pdf.rect(xPos, yPos, columnWidths[i], rowHeight)

                        // Draw each line of text in the cell
                        lines.forEach((line, lineIndex) => {
                            pdf.text(line, xPos + 2, yPos + 5 + lineIndex * lineHeight)
                        })

                        xPos += columnWidths[i]
                    })

                    // Move to next row
                    yPos += rowHeight
                }
            }

            // Add footer
            addFooter(pdf, pageWidth, pageHeight, dateStr)

            // Save the PDF
            pdf.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Failed to generate PDF. Please try downloading as HTML instead.")

            // Fallback to HTML download if PDF generation fails
            handleDownload()
        }
    }

    // Update the footer function to use the simplified date format
    const addFooter = (pdf, pageWidth, pageHeight, dateStr) => {
        const footerY = pageHeight - 20
        pdf.setFontSize(10)
        pdf.text("JESUS BE ALL THE GLORY!", pageWidth / 2, footerY, { align: "center" })
        pdf.text("© SSG QR Attendance", pageWidth / 2, footerY + 5, { align: "center" })
        pdf.text(`Generated on ${dateStr}`, pageWidth / 2, footerY + 10, { align: "center" })
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={handlePrint} variant="default">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Table
                </Button>

                <Button onClick={() => setPreviewOpen(true)} variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                </Button>

                <Button onClick={handleDownload} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download HTML
                </Button>

                <Button onClick={handleDownloadPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            <div ref={printRef}>
                {filteredData.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Year Level</TableHead>
                                <TableHead>Degree Program</TableHead>
                                <TableHead>Absences</TableHead>
                                <TableHead>Penalties</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.$id}>
                                    <TableCell className="break-words">{item.studentId}</TableCell>
                                    <TableCell className="break-words">{item.name}</TableCell>
                                    <TableCell className="break-words">{item.yearLevel || "-"}</TableCell>
                                    <TableCell className="break-words">{item.degreeProgram || "-"}</TableCell>
                                    <TableCell className="break-words">{item.absences}</TableCell>
                                    <TableCell className="break-words">{item.penalties}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="no-data">No records match the selected criteria</div>
                )}
            </div>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                        <DialogDescription>Preview of the table with your selected filters</DialogDescription>
                    </DialogHeader>

                    <div className="border text-black rounded-md p-4 bg-white">
                        <div className="text-right text-sm mb-2">
                            {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </div>

                        <h1 className="text-xl font-bold text-center mb-4">{title}</h1>

                        <div className="text-center text-sm mb-4">Absences Threshold: {absencesThreshold}</div>

                        {filteredData.length > 0 ? (
                            <div className="border border-gray-200">
                                <table className="w-full border-collapse table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 p-2 text-left w-[15%]">Student ID</th>
                                            <th className="border border-gray-300 p-2 text-left w-[15%]">Name</th>
                                            <th className="border border-gray-300 p-2 text-left w-[12%]">Year Level</th>
                                            <th className="border border-gray-300 p-2 text-left w-[15%]">Degree Program</th>
                                            <th className="border border-gray-300 p-2 text-left w-[10%]">Absences</th>
                                            <th className="border border-gray-300 p-2 text-left w-[33%]">Penalties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item) => (
                                            <tr key={item.$id}>
                                                <td className="border border-gray-300 p-2 break-words">{item.studentId}</td>
                                                <td className="border border-gray-300 p-2 break-words">{item.name}</td>
                                                <td className="border border-gray-300 p-2 break-words">{item.yearLevel || "-"}</td>
                                                <td className="border border-gray-300 p-2 break-words">{item.degreeProgram || "-"}</td>
                                                <td className="border border-gray-300 p-2 break-words">{item.absences}</td>
                                                <td className="border border-gray-300 p-2 break-words">{item.penalties}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center p-4 italic text-black border border-gray-200">
                                No records match the selected criteria
                            </div>
                        )}

                        <div className="text-center mt-6 text-sm text-black border-t pt-4">
                            <p>JESUS BE ALL THE GLORY!</p>
                            <p>© SSG QR Attendance</p>
                            <p>
                                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between mt-4">
                        <div className="flex gap-2">
                            <Button onClick={handleDownload} variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Download HTML
                            </Button>
                            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                        <Button onClick={handlePrint} size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
