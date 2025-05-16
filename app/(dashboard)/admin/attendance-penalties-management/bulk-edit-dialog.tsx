"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import type { FineDocument } from "@/lib/GeneralAttendance/GeneralAttendance"

interface BulkEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedFines: FineDocument[]
    onSave: (absences: string, presences: string) => Promise<void>
    isProcessing: boolean
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
    open,
    onOpenChange,
    selectedFines,
    onSave,
    isProcessing,
}) => {
    const [absences, setAbsences] = useState("")
    const [presences, setPresences] = useState("")
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

    // Reset state when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            // If we have selected fines, use the first one's values as default
            if (selectedFines.length > 0) {
                setAbsences(selectedFines[0].absences)
                setPresences(selectedFines[0].presences)
            } else {
                setAbsences("")
                setPresences("")
            }
        }
        onOpenChange(newOpen)
    }

    const handleSave = async () => {
        await onSave(absences, presences)
        setConfirmDialogOpen(false)
    }

    return (
        <>
            <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Edit Attendance</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update attendance information for {selectedFines.length} selected students.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="absences" className="text-right">
                                Absences
                            </Label>
                            <Input
                                id="absences"
                                type="number"
                                min="0"
                                value={absences}
                                onChange={(e) => setAbsences(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="presences" className="text-right">
                                Presences
                            </Label>
                            <Input
                                id="presences"
                                type="number"
                                min="0"
                                value={presences}
                                onChange={(e) => setPresences(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setConfirmDialogOpen(true)} disabled={isProcessing}>
                            Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirmation dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update {selectedFines.length} students to have {absences} absences and {presences} presences?
                            This action will affect all selected students.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSave} disabled={isProcessing}>
                            {isProcessing ? (
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
        </>
    )
}
