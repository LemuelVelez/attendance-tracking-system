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

// Update the User interface to include yearLevel and degreeProgram
export interface User extends Models.Document {
  $id: string
  studentId: string
  name: string
  email: string
  yearLevel?: string
  degreeProgram?: string
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
  yearLevel?: string
  degreeProgram?: string
}

export interface FineDocument extends FineDocumentData, Models.Document {
  yearLevel?: string
  degreeProgram?: string
}

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

// Helper function to retry API calls with exponential backoff
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await operation()
    } catch (error) {
      retries++
      if (retries > maxRetries) {
        console.error(`Operation failed after ${maxRetries} retries:`, error)
        throw error
      }

      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms delay...`)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Exponential backoff with jitter
      delay = delay * 2 + Math.floor(Math.random() * 1000)
    }
  }
}

// Function to get the penalties map from the database
export const getPenaltiesMap = async (): Promise<Record<number, string>> => {
  try {
    // Try to get the penalties map document
    try {
      const response = await retryOperation(() =>
        databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map"),
      )

      if (response && response.penalties) {
        return JSON.parse(response.penalties)
      }
    } catch (_error) {
      console.log("Penalties map document not found, will create a new one")

      // Create a document with the default penalties map
      try {
        await retryOperation(() =>
          databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            penalties: JSON.stringify(PENALTIES_MAP),
          }),
        )
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
      await retryOperation(() =>
        databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          penalties: JSON.stringify(penaltiesMap),
        }),
      )
      console.log("Penalties map updated successfully")
    } catch (_updateError) {
      // Document doesn't exist, create it
      try {
        await retryOperation(() =>
          databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            penalties: JSON.stringify(penaltiesMap),
          }),
        )
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

    // Use retry mechanism for the update operation
    const updatedDoc = await retryOperation(() =>
      databases.updateDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, documentId, fineData),
    )

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

      const response = await retryOperation(() =>
        databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries),
      )

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

      // Delete duplicates with delay between requests
      for (const id of duplicatesToDelete) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay between delete operations
        await retryOperation(() => databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, id))
      }

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

    await retryOperation(() => databases.deleteDocument(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, documentId))

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

    const existingDocuments = await retryOperation(() =>
      databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [
        Query.equal("userId", fineData.userId),
        Query.equal("studentId", fineData.studentId),
        Query.equal("dateIssued", fineData.dateIssued),
      ]),
    )

    if (existingDocuments.documents.length > 0) {
      const existingDoc = existingDocuments.documents[0]
      if (isFineDocument(existingDoc)) {
        // Update the existing document
        const updatedDoc = await retryOperation(() =>
          databases.updateDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, existingDoc.$id, fineData),
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
      const response = await retryOperation(() =>
        databases.createDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, ID.unique(), fineData),
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

      const response = await retryOperation(() =>
        databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, currentQueries),
      )

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

      // Delete duplicates with delay between requests
      for (const id of duplicatesToDelete) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay between delete operations
        await retryOperation(() => databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, id))
      }

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

// Replace the entire searchStudents function with this improved version
export const searchStudents = async (searchTerm: string): Promise<FineDocument[]> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // If search term is empty, return empty array
    if (!searchTerm.trim()) {
      return []
    }

    console.log(`Searching for: "${searchTerm}"`)

    // Fetch all documents without any filtering
    const response = await retryOperation(() =>
      databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [
        Query.limit(1000), // Increased limit to ensure we find all potential matches
      ]),
    )

    console.log(`Total documents fetched: ${response.documents.length}`)

    // Normalize search term for case-insensitive comparison
    const searchTermLower = searchTerm.toLowerCase().trim()

    // Split search term into words for multi-word search
    const searchWords = searchTermLower.split(/\s+/).filter((word) => word.length > 0)

    // Filter documents client-side with detailed logging
    const filteredDocuments = response.documents.filter((doc) => {
      if (!doc || typeof doc !== "object") return false

      // Safely access properties
      const name = doc.name ? String(doc.name).toLowerCase() : ""
      const studentId = doc.studentId ? String(doc.studentId).toLowerCase() : ""

      // Check for full search term match
      if (name.includes(searchTermLower) || studentId.includes(searchTermLower)) {
        return true
      }

      // For multi-word searches, check if all words are in the name
      if (searchWords.length > 1) {
        const allWordsFound = searchWords.every((word) => name.includes(word))
        return allWordsFound
      }

      return false
    })

    console.log(`Matches found: ${filteredDocuments.length}`)

    // Ensure all returned documents are valid FineDocuments
    const validDocuments = filteredDocuments.filter(isFineDocument)

    // Sort results with a simpler, more reliable algorithm
    const sortedResults = validDocuments.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()

      // Exact matches first
      const aExactMatch = aName === searchTermLower
      const bExactMatch = bName === searchTermLower
      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      // Starts with search term
      const aStartsWith = aName.startsWith(searchTermLower)
      const bStartsWith = bName.startsWith(searchTermLower)
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1

      // Contains all words in order
      if (searchWords.length > 1) {
        let aIndex = -1
        let bIndex = -1

        // Check if name contains all search words in sequence
        for (const word of searchWords) {
          aIndex = aName.indexOf(word, aIndex + 1)
          bIndex = bName.indexOf(word, bIndex + 1)

          if (aIndex === -1 && bIndex !== -1) return 1
          if (aIndex !== -1 && bIndex === -1) return -1
        }
      }

      // Default to alphabetical order
      return aName.localeCompare(bName)
    })

    // Return up to 20 results
    return sortedResults.slice(0, 20)
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

    await retryOperation(() => databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, documentId))

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
      const document = await retryOperation(() =>
        databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map"),
      )
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

      const response = await retryOperation(() =>
        databases.listDocuments(DATABASE_ID, GENERAL_ATTENDANCE_COLLECTION_ID, queries),
      )

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
        await retryOperation(() => databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map"))
        // Update existing document with total events
        await retryOperation(() =>
          databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            totalEvents: totalEventsCount.toString(),
          }),
        )
        console.log("Total events updated automatically:", totalEventsCount)
      } catch (_error) {
        // Document doesn't exist, create it
        try {
          await retryOperation(() =>
            databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
              penalties: JSON.stringify(PENALTIES_MAP),
              totalEvents: totalEventsCount.toString(),
            }),
          )
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

      const response = await retryOperation(() => databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, queries))

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
        await retryOperation(() => databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map"))
        await retryOperation(() =>
          databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            totalEvents: totalEvents.toString(),
          }),
        )
      } catch (_error) {
        await retryOperation(() =>
          databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
            penalties: JSON.stringify(PENALTIES_MAP),
            totalEvents: totalEvents.toString(),
          }),
        )
      }
    } catch (error) {
      console.error("Error updating total events:", error)
    }

    // Process each user with delay between operations
    for (const user of users) {
      // Add a small delay between processing each user to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))

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

      // Get year level and degree program from attendance records if available
      let yearLevel = ""
      let degreeProgram = ""

      if (userAttendance.length > 0) {
        const latestAttendance = userAttendance.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })[0]

        yearLevel = latestAttendance.yearLevel || ""
        degreeProgram = latestAttendance.degreeProgram || ""
      }

      // If year level or degree program is still empty, try to get it from the user object
      if (!yearLevel && user.yearLevel) {
        yearLevel = user.yearLevel
      }

      if (!degreeProgram && user.degreeProgram) {
        degreeProgram = user.degreeProgram
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
        yearLevel: yearLevel,
        degreeProgram: degreeProgram,
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
      documents = await retryOperation(() =>
        databases.listDocuments(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, [Query.limit(100)]),
      )

      for (const doc of documents.documents) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second delay
        await retryOperation(() => databases.deleteDocument(DATABASE_ID, FINES_MANAGEMENT_COLLECTION_ID, doc.$id))
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
      const document = await retryOperation(() =>
        databases.getDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map"),
      )

      // Update the existing document with the total events
      await retryOperation(() =>
        databases.updateDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          totalEvents: totalEventsStr,
        }),
      )
      console.log("Total events updated successfully")
    } catch (_error) {
      // Document doesn't exist, create it
      await retryOperation(() =>
        databases.createDocument(DATABASE_ID, PENALTIES_MAP_COLLECTION_ID, "penalties_map", {
          penalties: JSON.stringify(PENALTIES_MAP),
          totalEvents: totalEventsStr,
        }),
      )
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

    // Update each selected fine with delay between operations
    for (const fine of selectedFines) {
      // Add a small delay between operations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Calculate new presences value (ensure it doesn't go below 0)
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = Math.max(0, currentPresences - amount)

      // Create a clean data object with only the allowed fields
      const updatedFineData: FineDocumentData = {
        userId: fine.userId,
        studentId: fine.studentId,
        name: fine.name,
        absences: fine.absences, // This will be recalculated in updateFineDocument
        presences: newPresences.toString(),
        penalties: fine.penalties, // This will be recalculated in updateFineDocument
        dateIssued: fine.dateIssued,
        status: fine.status, // This will be recalculated in updateFineDocument
        yearLevel: fine.yearLevel,
        degreeProgram: fine.degreeProgram,
      }

      // Update the fine document
      await updateFineDocument(fine.$id, updatedFineData)
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

    // Update each non-exempted fine with delay between operations
    for (const fine of nonExemptedFines) {
      // Add a small delay between operations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Calculate new presences value (ensure it doesn't go below 0)
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = Math.max(0, currentPresences - amount)

      // Create a clean data object with only the allowed fields
      const updatedFineData: FineDocumentData = {
        userId: fine.userId,
        studentId: fine.studentId,
        name: fine.name,
        absences: fine.absences, // This will be recalculated in updateFineDocument
        presences: newPresences.toString(),
        penalties: fine.penalties, // This will be recalculated in updateFineDocument
        dateIssued: fine.dateIssued,
        status: fine.status, // This will be recalculated in updateFineDocument
        yearLevel: fine.yearLevel,
        degreeProgram: fine.degreeProgram,
      }

      // Update the fine document
      await updateFineDocument(fine.$id, updatedFineData)
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

    // Update each selected fine with delay between operations
    for (const fine of selectedFines) {
      // Add a small delay between operations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Calculate new presences value
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = currentPresences + amount

      // Create a clean data object with only the allowed fields
      const updatedFineData: FineDocumentData = {
        userId: fine.userId,
        studentId: fine.studentId,
        name: fine.name,
        absences: fine.absences, // This will be recalculated in updateFineDocument
        presences: newPresences.toString(),
        penalties: fine.penalties, // This will be recalculated in updateFineDocument
        dateIssued: fine.dateIssued,
        status: fine.status, // This will be recalculated in updateFineDocument
        yearLevel: fine.yearLevel,
        degreeProgram: fine.degreeProgram,
      }

      // Update the fine document
      await updateFineDocument(fine.$id, updatedFineData)
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

    // Update each non-exempted fine with delay between operations
    for (const fine of nonExemptedFines) {
      // Add a small delay between operations to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Calculate new presences value
      const currentPresences = Number.parseInt(fine.presences) || 0
      const newPresences = currentPresences + amount

      // Create a clean data object with only the allowed fields
      const updatedFineData: FineDocumentData = {
        userId: fine.userId,
        studentId: fine.studentId,
        name: fine.name,
        absences: fine.absences, // This will be recalculated in updateFineDocument
        presences: newPresences.toString(),
        penalties: fine.penalties, // This will be recalculated in updateFineDocument
        dateIssued: fine.dateIssued,
        status: fine.status, // This will be recalculated in updateFineDocument
        yearLevel: fine.yearLevel,
        degreeProgram: fine.degreeProgram,
      }

      // Update the fine document
      await updateFineDocument(fine.$id, updatedFineData)
    }

    console.log(`Increased presences by ${amount} for ${nonExemptedFines.length} non-exempted students`)
  } catch (error) {
    console.error("Error increasing presences for non-exempted students:", error)
    throw error
  }
}

// New function to increase presences for all students
export const increasePresencesForAll = async (increaseAmount: number): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure increase amount is positive
    const amount = Math.max(0, increaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 20
    const batches = []

    for (let i = 0; i < fines.length; i += batchSize) {
      batches.push(fines.slice(i, i + batchSize))
    }

    console.log(`Processing ${fines.length} students in ${batches.length} batches of ${batchSize}`)

    // Process each batch with a delay between batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

      // Process each fine in the batch with a small delay between operations
      for (const fine of batch) {
        // Add a small delay between operations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Calculate new presences value
        const currentPresences = Number.parseInt(fine.presences) || 0
        const newPresences = currentPresences + amount

        // Create a clean data object with only the allowed fields
        const updatedFineData: FineDocumentData = {
          userId: fine.userId,
          studentId: fine.studentId,
          name: fine.name,
          absences: fine.absences, // This will be recalculated in updateFineDocument
          presences: newPresences.toString(),
          penalties: fine.penalties, // This will be recalculated in updateFineDocument
          dateIssued: fine.dateIssued,
          status: fine.status, // This will be recalculated in updateFineDocument
          yearLevel: fine.yearLevel,
          degreeProgram: fine.degreeProgram,
        }

        // Update the fine document with retry
        await updateFineDocument(fine.$id, updatedFineData)
      }

      // Add a longer delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`Batch ${batchIndex + 1} complete. Waiting before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(`Increased presences by ${amount} for all ${fines.length} students`)
  } catch (error) {
    console.error("Error increasing presences for all students:", error)
    throw error
  }
}

// New function to decrease presences for all students
export const decreasePresencesForAll = async (decreaseAmount: number): Promise<void> => {
  try {
    if (!DATABASE_ID || !FINES_MANAGEMENT_COLLECTION_ID) {
      throw new Error("Missing Appwrite environment variables. Please check your .env file.")
    }

    // Ensure decrease amount is positive
    const amount = Math.max(0, decreaseAmount)
    if (amount === 0) return

    // Get all fine documents
    const fines = await getFineDocuments()

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 20
    const batches = []

    for (let i = 0; i < fines.length; i += batchSize) {
      batches.push(fines.slice(i, i + batchSize))
    }

    console.log(`Processing ${fines.length} students in ${batches.length} batches of ${batchSize}`)

    // Process each batch with a delay between batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

      // Process each fine in the batch with a small delay between operations
      for (const fine of batch) {
        // Add a small delay between operations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Calculate new presences value (ensure it doesn't go below 0)
        const currentPresences = Number.parseInt(fine.presences) || 0
        const newPresences = Math.max(0, currentPresences - amount)

        // Create a clean data object with only the allowed fields
        const updatedFineData: FineDocumentData = {
          userId: fine.userId,
          studentId: fine.studentId,
          name: fine.name,
          absences: fine.absences, // This will be recalculated in updateFineDocument
          presences: newPresences.toString(),
          penalties: fine.penalties, // This will be recalculated in updateFineDocument
          dateIssued: fine.dateIssued,
          status: fine.status, // This will be recalculated in updateFineDocument
          yearLevel: fine.yearLevel,
          degreeProgram: fine.degreeProgram,
        }

        // Update the fine document with retry
        await updateFineDocument(fine.$id, updatedFineData)
      }

      // Add a longer delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`Batch ${batchIndex + 1} complete. Waiting before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(`Decreased presences by ${amount} for all ${fines.length} students`)
  } catch (error) {
    console.error("Error decreasing presences for all students:", error)
    throw error
  }
}

// Updated function to increase presences by year level and degree program
export const increasePresencesByYearAndProgram = async (
  yearLevel: string,
  degreeProgram: string,
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

    console.log(`Filtering with yearLevel: "${yearLevel}" and degreeProgram: "${degreeProgram}"`)

    // Filter by year level and degree program if provided
    const filteredFines = fines.filter((fine) => {
      // More explicit filtering logic with better handling of specific cases
      let matchesYear = false;
      let matchesProgram = false;
      
      // Year level matching
      if (!yearLevel || yearLevel === "all") {
        matchesYear = true; // Include all year levels
      } else if (fine.yearLevel === yearLevel) {
        matchesYear = true; // Include only the specific year level
      }
      
      // Degree program matching
      if (!degreeProgram || degreeProgram === "all") {
        matchesProgram = true; // Include all degree programs
      } else if (fine.degreeProgram === degreeProgram) {
        matchesProgram = true; // Include only the specific degree program
      }
      
      // Both conditions must be true for the student to be included
      return matchesYear && matchesProgram;
    })

    console.log(`Found ${filteredFines.length} students matching the criteria`)
    
    if (filteredFines.length === 0) {
      console.log("No students match the specified year level and degree program")
      return
    }

    // Log some sample data to help with debugging
    if (filteredFines.length > 0) {
      console.log("Sample matched students:");
      filteredFines.slice(0, 3).forEach(fine => {
        console.log(`- Name: ${fine.name}, Year: ${fine.yearLevel}, Program: ${fine.degreeProgram}`);
      });
    }

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 20
    const batches = []

    for (let i = 0; i < filteredFines.length; i += batchSize) {
      batches.push(filteredFines.slice(i, i + batchSize))
    }

    console.log(`Processing ${filteredFines.length} students in ${batches.length} batches of ${batchSize}`)

    // Process each batch with a delay between batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

      // Process each fine in the batch with a small delay between operations
      for (const fine of batch) {
        // Add a small delay between operations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Calculate new presences value
        const currentPresences = Number.parseInt(fine.presences) || 0
        const newPresences = currentPresences + amount

        // Create a clean data object with only the allowed fields
        const updatedFineData: FineDocumentData = {
          userId: fine.userId,
          studentId: fine.studentId,
          name: fine.name,
          absences: fine.absences, // This will be recalculated in updateFineDocument
          presences: newPresences.toString(),
          penalties: fine.penalties, // This will be recalculated in updateFineDocument
          dateIssued: fine.dateIssued,
          status: fine.status, // This will be recalculated in updateFineDocument
          yearLevel: fine.yearLevel,
          degreeProgram: fine.degreeProgram,
        }

        // Update the fine document with retry
        await updateFineDocument(fine.$id, updatedFineData)
      }

      // Add a longer delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`Batch ${batchIndex + 1} complete. Waiting before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(
      `Increased presences by ${amount} for ${filteredFines.length} students in ${yearLevel || "all years"}, ${degreeProgram || "all programs"}`,
    )
  } catch (error) {
    console.error("Error increasing presences by year level and degree program:", error)
    throw error
  }
}

// Updated function to decrease presences by year level and degree program
export const decreasePresencesByYearAndProgram = async (
  yearLevel: string,
  degreeProgram: string,
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

    console.log(`Filtering with yearLevel: "${yearLevel}" and degreeProgram: "${degreeProgram}"`)

    // Filter by year level and degree program if provided
    const filteredFines = fines.filter((fine) => {
      // More explicit filtering logic with better handling of specific cases
      let matchesYear = false;
      let matchesProgram = false;
      
      // Year level matching
      if (!yearLevel || yearLevel === "all") {
        matchesYear = true; // Include all year levels
      } else if (fine.yearLevel === yearLevel) {
        matchesYear = true; // Include only the specific year level
      }
      
      // Degree program matching
      if (!degreeProgram || degreeProgram === "all") {
        matchesProgram = true; // Include all degree programs
      } else if (fine.degreeProgram === degreeProgram) {
        matchesProgram = true; // Include only the specific degree program
      }
      
      // Both conditions must be true for the student to be included
      return matchesYear && matchesProgram;
    })

    console.log(`Found ${filteredFines.length} students matching the criteria`)
    
    if (filteredFines.length === 0) {
      console.log("No students match the specified year level and degree program")
      return
    }

    // Log some sample data to help with debugging
    if (filteredFines.length > 0) {
      console.log("Sample matched students:");
      filteredFines.slice(0, 3).forEach(fine => {
        console.log(`- Name: ${fine.name}, Year: ${fine.yearLevel}, Program: ${fine.degreeProgram}`);
      });
    }

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 20
    const batches = []

    for (let i = 0; i < filteredFines.length; i += batchSize) {
      batches.push(filteredFines.slice(i, i + batchSize))
    }

    console.log(`Processing ${filteredFines.length} students in ${batches.length} batches of ${batchSize}`)

    // Process each batch with a delay between batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

      // Process each fine in the batch with a small delay between operations
      for (const fine of batch) {
        // Add a small delay between operations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Calculate new presences value (ensure it doesn't go below 0)
        const currentPresences = Number.parseInt(fine.presences) || 0
        const newPresences = Math.max(0, currentPresences - amount)

        // Create a clean data object with only the allowed fields
        const updatedFineData: FineDocumentData = {
          userId: fine.userId,
          studentId: fine.studentId,
          name: fine.name,
          absences: fine.absences, // This will be recalculated in updateFineDocument
          presences: newPresences.toString(),
          penalties: fine.penalties, // This will be recalculated in updateFineDocument
          dateIssued: fine.dateIssued,
          status: fine.status, // This will be recalculated in updateFineDocument
          yearLevel: fine.yearLevel,
          degreeProgram: fine.degreeProgram,
        }

        // Update the fine document with retry
        await updateFineDocument(fine.$id, updatedFineData)
      }

      // Add a longer delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`Batch ${batchIndex + 1} complete. Waiting before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(
      `Decreased presences by ${amount} for ${filteredFines.length} students in ${yearLevel || "all years"}, ${degreeProgram || "all programs"}`,
    )
  } catch (error) {
    console.error("Error decreasing presences by year level and degree program:", error)
    throw error
  }
}