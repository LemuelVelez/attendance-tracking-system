# SSG Attendance and Participation Tracking System

## Objective
Design and implement a web application for the Supreme Student Government (SSG) to efficiently manage attendance at events and meetings. This system allows students to register, log in using their student ID and password, and track attendance via QR codes. It supports offline functionality, automated attendance reports, fine calculations for absences, and export options (PDF/CSV).

## Features

### 1. Core Features
- **Student Registration:**  
  Students can register by providing their personal information (name, student ID, password), which is stored in the database for login authentication.

- **Student Login:**  
  After registration, students can log in using their student ID and password, with successful login redirecting them to their personalized dashboard.

- **Student Dashboard:**  
  Displays the student’s event participation, attendance history, and upcoming events.

- **Event QR Code Generation:**  
  Admins can generate unique QR codes for each event, which students can scan to check in.

- **Personal QR Code Generation:**  
  Each student can opt to generate a unique QR code that is used for event check-ins, helping with attendance tracking.

- **QR Code Scanning:**  
  Students can scan the event QR code or the admins scan their personal QR code to check in. This ensures easy access and authentication.

- **Attendance Reports:**  
  Generate automatic attendance reports, listing attendees with check-in timestamps, and allowing export in PDF or CSV format.

- **Time-Limited Access:**  
  Implement a time limit for event check-ins to ensure students are marked absent if they fail to check in on time.

### 2. Anti-Cheating Measures
- **Kiosk Scanning:**  
  Dedicated kiosks are available for students to scan QR codes for event check-ins.

- **Single Scan Per Student:**  
  Each student can only scan once or twice per event. Multiple scans are prevented.

- **Physical Presence Verification:**  
  Using Geolocation API, the system verifies that the student is physically present at the event location when they scan the QR code.

- **Monitoring Attendance Timing:**  
  The system logs the scan timestamp and flags any scans that occur outside the allowed event window.

- **Notifications to Students:**  
  Push notifications or in-app alerts remind students about attendance time limits and procedures.

### 3. Absence Fines
- **Customizable Absence Fines:**  
  Admins can set different fines for events. These fines are customizable based on event importance.

- **Overall Fines Calculation:**  
  Admins can calculate the overall fines for individual students based on their absences, with reports available for download in PDF/CSV format.

### 4. Mobile-Friendly
- **Responsive Design:**  
  The system is optimized for mobile devices, allowing students to easily scan QR codes for check-ins and access their attendance reports.

## Tech Stack

### Frontend:
- **Next.js** (v15.x): For server-side rendering and React-based frontend.
- **Shadcn UI**: For reusable and accessible UI components.
- **Tailwind CSS**: For responsive and customizable styling.
- **GSAP**: For smooth animations and transitions.
- **TypeScript**: For type-safe development.

### Backend:
- **Node.js**: For server-side logic, QR code generation, scanning processes, and attendance fine tracking.
- **Appwrite**: For database management (handling student data, attendance logs, event details) and file storage (for PDFs and CSV reports).
- **QR Code Generation**: Use the `qrcode` library in Node.js to generate QR codes.

### Additional Libraries/Tools:
- **next-pwa**: To add Progressive Web App (PWA) features and offline capabilities.
- **IndexedDB** or **localStorage**: For offline storage of check-ins and syncing data.
- **pdf-lib**: For generating exportable PDF reports.
- **Geolocation API**: For physical presence verification during QR code scanning.

## Workflow and Flow

1. **Student Registration & QR Code Generation:**  
   Students register via the admin panel. A unique personal QR code is generated for each student.

2. **Student Login:**  
   After registration, students log in with their student ID and password. They are redirected to their personalized dashboard.

3. **Event QR Code Generation:**  
   Admins create events via the admin panel, and the system generates a unique event QR code.

4. **Event Check-in:**  
   Students scan both the event QR code and their personal QR code to check in. The system validates the QR code and logs attendance.

5. **Reports and Fines:**  
   Attendance reports are automatically generated and can be exported. Fines are tracked based on absences.

6. **Admin Dashboard:**  
   Admins can manage events, view attendance reports, and monitor attendance fines.

## Deployment

- **Hosting**: Use Vercel for easy deployment of the Next.js application.
- **Database**: Use Appwrite as the backend service for authentication, file storage, and database management.
- **PWA**: With next-pwa, the app functions as a Progressive Web App, ensuring offline functionality.

## Running Locally

1. Clone this repository.
   ```bash
   git clone https://github.com/your-username/ssg-attendance-tracking.git
   ```

2. Install dependencies.
   ```bash
   cd ssg-attendance-tracking
   npm install
   ```

3. Set up environment variables in a `.env` file based on the configuration in the documentation.

4. Run the development server.
   ```bash
   npm run dev
   ```

5. Navigate to `http://localhost:3000` to access the application locally.

## License
This project is licensed under the MIT License