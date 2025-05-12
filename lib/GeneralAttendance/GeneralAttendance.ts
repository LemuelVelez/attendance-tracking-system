/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, Databases, ID, type Models, Query } from "appwrite"

const client = new Client()
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

const databases = new Databases(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
const GENERAL_ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GENERAL_ATTENDANCE_COLLECTION_ID || ""
const FINES_MANAGEMENT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FINES_MANAGEMENT_COLLECTION_ID || ""
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || ""
const PENALTIES_MAP_COLLECTION_ID = "penalties_map" // Collection for storing penalties map

export interface Attendance extends Models.Document {
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
}

export interface User extends Models.Document {
  $id: string
  studentId: string
  name: string
  email: string
}

export interface FineDocumentData {
  userId: string
  studentId: string
  name: string
  absences: string
  presences: string
  penalties: string
  dateIssued: string
  status: "Pending" | "Cleared" | "penaltyCleared"
}

export interface FineDocument extends FineDocumentData, Models.Document {}

// Default penalties map
let PENALTIES_MAP: Record<number, string> = {
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
}

function isFineDocument(doc: unknown): doc is FineDocument {
  if (typeof doc !== "object" || doc === null) {
    console.log("Document is not an object")
    return false
  }

  const fineDoc = doc as Partial<FineDocument>
  const requiredProps = [
    "$id",
    "userId",
    "studentId",
    "name",
    "absences",
    "presences",
    "penalties",
    "dateIssued",
    "status",
  ]
  const missingProps = requiredProps.filter((prop) => !(prop in fineDoc))

  if (missingProps.length > 0) {
    console.log("Missing properties:", missingProps)
    return false
  }

  if (fineDoc.status !== "Pending" && fineDoc.status !== "Cleared" && fineDoc.status !== "penaltyCleared") {
    console.log("Invalid status:", fineDoc.status)
    return false
  }

  return true
}

// Function to get the penalties map from the database
export const getPenaltiesMap = async (): Promise<Record<number, string>> => {
  try {
    // Try to get the penalties map document
    try {
      const response = await databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map")

      if (response && response.penalties) {
        return JSON.parse(response.penalties)
      }
    } catch (_error) {
      console.log("Penalties map document not found, will create a new one")

      // Create a document with the default penalties map
      try {
        await databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          penalties: JSON.stringify(PENALTIES_MAP),
        })
      } catch (createError) {
        console.error("Error creating penalties map document:", createError)
      }
    }

    return PENALTIES_MAP // Return default penalties map
  } catch (fetchError) {
    console.error("Error getting penalties map:", fetchError)
    return PENALTIES_MAP // Return default penalties map if there's an error
  }
}

// Function to update the penalties map in the database
export const updatePenaltiesMap = async (penaltiesMap: Record<number, string>): Promise<void> => {
  try {
    // Update the global variable
    PENALTIES_MAP = penaltiesMap

    // Update or create the penalties map document
    try {
      await databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
        penalties: JSON.stringify(penaltiesMap),
      })
      console.log("Penalties map updated successfully")
    } catch (_updateError) {
      // Document doesn't exist, create it
      try {
        await databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          penalties: JSON.stringify(penaltiesMap),
        })
        console.log("Penalties map created successfully")
      } catch (createError) {
        console.error("Error creating penalties map document:", createError)
        throw createError
      }
    }
  } catch (error) {
    console.error("Error updating penalties map:", error)
    throw error
  }
}

// Enhanced function to update a fine document with automatic absence calculation
export const updateFineDocument = async (documentId: string, fineData: FineDocumentData): Promise<FineDocument> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Get total events
    const totalEvents = await getTotalUniqueEvents()

    // Get current penalties map
    const penaltiesMap = await getPenaltiesMap()

    // Ensure presences is a non-negative number
    const presences = Math.max(0, Number.parseInt(fineData.presences) || 0)

    // Calculate absences based on presences and total events
    const absences = Math.max(0, totalEvents - presences)

    // Update the fineData with calculated values
    fineData.presences = presences.toString()
    fineData.absences = absences.toString()

    // Determine penalty based on absences
    const penaltyLevels = Object.keys(penaltiesMap)
      .map(Number)
      .sort((a, b) => b - a)
    const highestPenaltyLevel = penaltyLevels.length > 0 ? penaltyLevels[0] : 10

    let penalty = "No penalty"
    if (penaltiesMap[absences]) {
      penalty = penaltiesMap[absences]
    } else if (absences > 0) {
      // Find the closest penalty level that's less than or equal to the absences
      const closestLevel = penaltyLevels.find((level) => level <= absences) || highestPenaltyLevel
      penalty = penaltiesMap[closestLevel] || penaltiesMap[highestPenaltyLevel] || "No penalty"
    }

    fineData.penalties = penalty

    // Update status based on penalty
    fineData.status = penalty === "No penalty" ? "Cleared" : "Pending"

    const updatedDoc = await databases.updateDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, documentId, fineData)

    console.log("Updated fine document:", updatedDoc)

    if (!isFineDocument(updatedDoc)) {
      throw new Error("Updated document does not match FineDocument structure")
    }

    return updatedDoc
  } catch (error) {
    console.error("Error updating fine document:", error)
    throw error
  }
}

export const getGeneralAttendance = async (): Promise<Attendance[]> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allDocuments: Attendance[] = []
    let lastId: string | undefined

    while (true) {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries)

      const uniqueMap = new Map<string, Attendance>()
      const duplicatesToDelete: string[] = []

      response.documents.forEach((doc: Models.Document) => {
        const attendance = doc as Attendance
        const key = `${attendance.userId}-${attendance.eventName}-${attendance.date}`
        if (uniqueMap.has(key)) {
          duplicatesToDelete.push(doc.$id)
        } else {
          uniqueMap.set(key, attendance)
        }
      })

      await Promise.all(
        duplicatesToDelete.map((id) => databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, id)),
      )

      console.log(`Deleted ${duplicatesToDelete.length} duplicate records.`)

      allDocuments.push(...Array.from(uniqueMap.values()))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allDocuments
  } catch (error) {
    console.error("Error in getGeneralAttendance:", error)
    throw error
  }
}

export const deleteGeneralAttendance = async (documentId: string): Promise<void> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    await databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, documentId)

    console.log(`Successfully deleted document with ID: ${documentId}`)
  } catch (error) {
    console.error("Error in deleteGeneralAttendance:", error)
    throw error
  }
}

export const createFineDocument = async (fineData: FineDocumentData): Promise<FineDocument> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const existingDocuments = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [
      Query.equal("userId", fineData.userId),
      Query.equal("studentId", fineData.studentId),
      Query.equal("dateIssued", fineData.dateIssued),
    ])

    if (existingDocuments.documents.length > 0) {
      const existingDoc = existingDocuments.documents[0]
      if (isFineDocument(existingDoc)) {
        // Update the existing document
        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          FINES_MANAGEMENT_COLLECTION_ID,
          existingDoc.$id,
          fineData,
        )
        console.log("Updated existing fine document:", updatedDoc)
        if (isFineDocument(updatedDoc)) {
          return updatedDoc
        } else {
          throw new Error("Updated document does not match FineDocument structure")
        }
      } else {
        throw new Error("Existing document does not match FineDocument structure")
      }
    } else {
      // Create a new document
      const response = await databases.createDocument(
        DATABASE_ID,
        FINES_MANAGEMENT_COLLECTION_ID,
        ID.unique(),
        fineData,
      )

      console.log("Created new fine document:", response)

      if (!isFineDocument(response)) {
        console.error("Document structure mismatch:", response)
        throw new Error("Created document does not match FineDocument structure")
      }

      console.log(`Successfully created fine document with ID: ${response.$id}`)
      return response
    }
  } catch (error) {
    console.error("Error in createFineDocument:", error)
    throw error
  }
}

export const getFineDocuments = async (queries: string[] = []): Promise<FineDocument[]> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allDocuments: FineDocument[] = []
    let lastId: string | undefined

    while (true) {
      const currentQueries = [...queries, Query.limit(100), Query.orderDesc("$createdAt")]
      if (lastId) {
        currentQueries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, currentQueries)

      const fineDocuments = response.documents.filter(isFineDocument)

      // Check for duplicates and delete them
      const uniqueFines = new Map<string, FineDocument>()
      const duplicatesToDelete: string[] = []

      for (const fine of fineDocuments) {
        const key = `${fine.studentId}-${fine.userId}-${fine.name}`
        if (uniqueFines.has(key)) {
          // Mark the duplicate for deletion
          duplicatesToDelete.push(fine.$id)
        } else {
          uniqueFines.set(key, fine)
        }
      }

      // Delete duplicates
      await Promise.all(
        duplicatesToDelete.map((id) => databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, id)),
      )

      console.log(`Deleted ${duplicatesToDelete.length} duplicate fine(s).`)

      allDocuments.push(...Array.from(uniqueFines.values()))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allDocuments
  } catch (error) {
    console.error("Error in getFineDocuments:", error)
    throw error
  }
}

// Replace the searchStudents function with this improved version
export const searchStudents = async (searchTerm: string): Promise<FineDocument[]> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // If search term is empty, return empty array
    if (!searchTerm.trim()) {
      return []
    }

    // Fetch all records (with a reasonable limit)
    const response = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [
      Query.limit(500), // Increased limit to find more potential matches
    ])

    // Filter documents client-side based on the search term
    const searchTermLower = searchTerm.toLowerCase().trim()

    // Log for debugging
    console.log(`Searching for: "${searchTermLower}"`)
    console.log(`Total documents fetched: ${response.documents.length}`)

    const filteredDocuments = response.documents.filter((doc) => {
      if (!doc || typeof doc !== "object") return false

      // Safely access properties
      const name = doc.name ? String(doc.name).toLowerCase() : ""
      const studentId = doc.studentId ? String(doc.studentId).toLowerCase() : ""

      // Check if name or studentId contains the search term (case-insensitive)
      const nameMatch = name.includes(searchTermLower)
      const idMatch = studentId.includes(searchTermLower)

      // For debugging
      if (nameMatch || idMatch) {
        console.log(`Match found: ${doc.name} (${doc.studentId})`)
      }

      return nameMatch || idMatch
    })

    console.log(`Matches found: ${filteredDocuments.length}`)

    // Ensure all returned documents are valid FineDocuments
    const validDocuments = filteredDocuments.filter(isFineDocument)

    // Return up to 20 results (increased from 10)
    return validDocuments.slice(0, 20)
  } catch (error) {
    console.error("Error searching students:", error)
    throw error
  }
}

export const deleteFines = async (documentId: string): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    await databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, documentId)

    console.log(`Successfully deleted fine document with ID: ${documentId}`)
  } catch (error) {
    console.error("Error in deleteFines:", error)
    throw error
  }
}

// Fixed function to get total unique events
export const getTotalUniqueEvents = async (): Promise<number> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Try to get the stored total events value first
    try {
      const document = await databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map")
      if (document && document.totalEvents !== undefined) {
        const totalEvents = Number.parseInt(document.totalEvents)
        if (!isNaN(totalEvents) && totalEvents > 0) {
          return totalEvents
        }
      }
    } catch (_error) {
      // If document doesn't exist or doesn't have totalEvents, continue with counting
    }

    // Count unique events if no stored value exists
    const uniqueEvents = new Set<string>()
    let lastId: string | undefined

    while (true) {
      const queries = [Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries)

      response.documents.forEach((doc: Models.Document) => {
        if ((doc as Attendance).eventName) {
          uniqueEvents.add((doc as Attendance).eventName)
        }
      })

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    const totalEventsCount = uniqueEvents.size

    // Only store the count if we actually found events
    if (totalEventsCount > 0) {
      // Auto-create or update the total events in the penalties_map collection
      try {
        await databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map")
        // Update existing document with total events
        await databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          totalEvents: totalEventsCount.toString(),
        })
        console.log("Total events updated automatically:", totalEventsCount)
      } catch (_error) {
        // Document doesn't exist, create it
        try {
          await databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            penalties: JSON.stringify(PENALTIES_MAP),
            totalEvents: totalEventsCount.toString(),
          })
          console.log("Total events created automatically:", totalEventsCount)
        } catch (createError) {
          console.error("Error creating penalties map document with total events:", createError)
        }
      }
    }

    return totalEventsCount
  } catch (error) {
    console.error("Error in getTotalUniqueEvents:", error)
    throw error
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    if (!DATABASE_ID || !USERS_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    const allUsers: User[] = []
    let lastId: string | undefined

    while (true) {
      const queries = [Query.limit(100)]
      if (lastId) {
        queries.push(Query.cursorAfter(lastId))
      }

      const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, queries)

      allUsers.push(...(response.documents as User[]))

      if (response.documents.length < 100) {
        break
      }

      lastId = response.documents[response.documents.length - 1].$id
    }

    return allUsers
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    throw error
  }
}

// Update the updateAttendance function to handle the highest penalty level dynamically
export const updateAttendance = async (): Promise<void> => {
  try {
    if (!DATABASE_ID || !GENERAL_ATTENDANCE_COLLECTION_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Get the latest penalties map
    const currentPenaltiesMap = await getPenaltiesMap()
    PENALTIES_MAP = currentPenaltiesMap

    // Find the highest penalty level
    const penaltyLevels = Object.keys(PENALTIES_MAP)
      .map(Number)
      .sort((a, b) => b - a)
    const highestPenaltyLevel = penaltyLevels.length > 0 ? penaltyLevels[0] : 10

    // Delete all existing fine documents
    await deleteAllFineDocuments()

    // Check if there are any remaining documents
    const remainingDocs = await getFineDocuments()
    if (remainingDocs.length > 0) {
      throw new Error("Not all documents were deleted. Please try again.")
    }

    // Get all attendance records
    const generalAttendance = await getGeneralAttendance()

    // Get all users
    const users = await getAllUsers()

    // Get unique event names from attendance records
    const uniqueEvents = new Set<string>()
    generalAttendance.forEach((attendance) => {
      if (attendance.eventName) {
        uniqueEvents.add(attendance.eventName)
      }
    })

    // Calculate total events
    const totalEvents = uniqueEvents.size

    // Update the total events in the penalties_map collection
    try {
      try {
        await databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map")
        await databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          totalEvents: totalEvents.toString(),
        })
      } catch (_error) {
        await databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          penalties: JSON.stringify(PENALTIES_MAP),
          totalEvents: totalEvents.toString(),
        })
      }
    } catch (error) {
      console.error("Error updating total events:", error)
    }

    // Process each user
    for (const user of users) {
      // Get attendance records for this user
      const userAttendance = generalAttendance.filter((a) => a.userId === user.$id)

      // Count unique events this user attended
      const attendedEvents = new Set<string>()
      userAttendance.forEach((attendance) => {
        if (attendance.eventName) {
          attendedEvents.add(attendance.eventName)
        }
      })

      // Calculate presences and absences
      const presences = attendedEvents.size
      const absences = Math.max(0, totalEvents - presences)

      // Determine penalty based on absences
      // If absences exceed the highest defined level, use the highest level penalty
      let penalty = "No penalty"
      if (PENALTIES_MAP[absences]) {
        penalty = PENALTIES_MAP[absences]
      } else if (absences > 0) {
        // Find the closest penalty level that's less than or equal to the absences
        const closestLevel = penaltyLevels.find((level) => level <= absences) || highestPenaltyLevel
        penalty = PENALTIES_MAP[closestLevel] || PENALTIES_MAP[highestPenaltyLevel] || "No penalty"
      }

      // Create fine document
      const fineData: FineDocumentData = {
        userId: user.$id,
        studentId: user.studentId,
        name: user.name,
        absences: absences.toString(),
        presences: presences.toString(),
        penalties: penalty,
        dateIssued: new Date().toISOString().split("T")[0],
        status: penalty === "No penalty" ? "Cleared" : "Pending",
      }

      // Create new fine document
      await createFineDocument(fineData)
    }

    console.log("Attendance and fines updated successfully")
    console.log(`Total events: ${totalEvents}`)
  } catch (error) {
    console.error("Error in updateAttendance:", error)
    throw error
  }
}

async function deleteAllFineDocuments() {
  try {
    let documents
    do {
      documents = await databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [Query.limit(100)])

      for (const doc of documents.documents) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second delay
        await databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, doc.$id)
        console.log(`Deleted document ${doc.$id}`)
      }
    } while (documents.documents.length > 0)

    console.log("All fine documents deleted successfully")
  } catch (error) {
    console.error("Error deleting fine documents:", error)
    throw error
  }
}

export const updateTotalEvents = async (totalEvents: number | string): Promise<void> => {
  try {
    // Convert to string if it's a number
    const totalEventsStr = typeof totalEvents === "number" ? totalEvents.toString() : totalEvents

    // Check if the penalties_map document exists
    try {
      const document = await databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map")

      // Update the existing document with the total events
      await databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
        totalEvents: totalEventsStr,
      })
      console.log("Total events updated successfully")
    } catch (_error) {
      // Document doesn't exist, create it
      await databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
        penalties: JSON.stringify(PENALTIES_MAP),
        totalEvents: totalEventsStr,
      })
      console.log("Total events created successfully")
    }
  } catch (error) {
    console.error("Error updating total events:", error)
    throw error
  }
}

// New function to decrease presences for selected students
export const decreasePresencesForSelected = async (studentIds: string[], decreaseAmount: number): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure decrease amount is positive
    const amount = Math.max(0, decreaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Filter for selected students
    const selectedFines = fines.filter((fine) => studentIds.includes(fine.studentId))

    // Update each selected fine
    for (const fine of selectedFines) {
      // Calculate new presences value (ensure it doesn't go below 0)
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = Math.max(0, currentPresences - amount)

      // Update the fine document
      await updateFineDocument(fine.$id, {
        ...fine,
        presences: newPresences.toString(),
        // absences will be automatically calculated in updateFineDocument
      })
    }

    console.log(`Decreased presences by ${amount} for ${selectedFines.length} students`)
  } catch (error) {
    console.error("Error decreasing presences for selected students:", error)
    throw error
  }
}

// New function to decrease presences for all except exempted students
export const decreasePresencesExceptExempted = async (
  exemptedStudentIds: string[],
  decreaseAmount: number,
): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure decrease amount is positive
    const amount = Math.max(0, decreaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Filter for non-exempted students
    const nonExemptedFines = fines.filter((fine) => !exemptedStudentIds.includes(fine.studentId))

    // Update each non-exempted fine
    for (const fine of nonExemptedFines) {
      // Calculate new presences value (ensure it doesn't go below 0)
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = Math.max(0, currentPresences - amount)

      // Update the fine document
      await updateFineDocument(fine.$id, {
        ...fine,
        presences: newPresences.toString(),
        // absences will be automatically calculated in updateFineDocument
      })
    }

    console.log(`Decreased presences by ${amount} for ${nonExemptedFines.length} non-exempted students`)
  } catch (error) {
    console.error("Error decreasing presences for non-exempted students:", error)
    throw error
  }
}

// New function to increase presences for selected students
export const increasePresencesForSelected = async (studentIds: string[], increaseAmount: number): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure increase amount is positive
    const amount = Math.max(0, increaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Filter for selected students
    const selectedFines = fines.filter((fine) => studentIds.includes(fine.studentId))

    // Update each selected fine
    for (const fine of selectedFines) {
      // Calculate new presences value
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = currentPresences + amount

      // Update the fine document
      await updateFineDocument(fine.$id, {
        ...fine,
        presences: newPresences.toString(),
        // absences will be automatically calculated in updateFineDocument
      })
    }

    console.log(`Increased presences by ${amount} for ${selectedFines.length} students`)
  } catch (error) {
    console.error("Error increasing presences for selected students:", error)
    throw error
  }
}

// New function to increase presences for all except exempted students
export const increasePresencesExceptExempted = async (
  exemptedStudentIds: string[],
  increaseAmount: number,
): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure increase amount is positive
    const amount = Math.max(0, increaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Filter for non-exempted students
    const nonExemptedFines = fines.filter((fine) => !exemptedStudentIds.includes(fine.studentId))

    // Update each non-exempted fine
    for (const fine of nonExemptedFines) {
      // Calculate new presences value
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = currentPresences + amount

      // Update the fine document
      await updateFineDocument(fine.$id, {
        ...fine,
        presences: newPresences.toString(),
        // absences will be automatically calculated in updateFineDocument
      })
    }

    console.log(`Increased presences by ${amount} for ${nonExemptedFines.length} non-exempted students`)
  } catch (error) {
    console.error("Error increasing presences for non-exempted students:", error)
    throw error
  }
}
