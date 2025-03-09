import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

export function ErrorInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">View Common Errors and Solutions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs lg:max-w-sm">
        <DialogHeader>
          <DialogTitle>Frequent Errors and Solutions</DialogTitle>
          <DialogDescription>USE GOOGLE CHROME OR ANY OTHER BROWSER FOR OPTIMAL EXPERIENCE.</DialogDescription>
        </DialogHeader>
        <div className="mb-4 px-1">
          <Button
            asChild
            variant="default"
            className="w-full py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 animate-pulse"
          >
            <Link
              href="https://m.me/jedirah?hash=AbawK5oBM8EaUaxh&source=qr_link_share"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                <path d="M8 12h.01" />
                <path d="M12 12h.01" />
                <path d="M16 12h.01" />
              </svg>
              <span>CLICK FOR QR CODE HELP</span>
            </Link>
          </Button>
          <p className="text-xs mt-1 text-muted-foreground text-center">Contact support for issues you can&apos;t solve</p>
        </div>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">1. Issue: User Not Found &amp; ERROR DURING SIGN UP/REGISTRATION.</h3>
              <p className="mt-2">
                <span className="font-bold text-red-600">Important:</span> If your registration fails on the first attempt, please contact the developer immediately: Lemuel Tumala Velez (<a href="https://www.facebook.com/share/161vabQJzL/" target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>).
              </p>
            </div>
            <div>
              <h3 className="font-bold">2. Issue: Invalid Email or Password</h3>
              <p>Primary Solution: Double-check your password for accuracy, then try logging in again.</p>
              <p>
                Note: This issue might also occur due to a typo during registration. For example, you might have registered as &quot;TC-22-00123&quot; but are trying to log in with &quot;TC-22-A-00123&quot;. Double-check your registration details and ensure you’re using the exact same information when logging in.
              </p>
              <p className="mt-2">
                <span className="font-bold text-red-600">Important:</span> If the problem persists, please contact the developer immediately: Lemuel Tumala Velez (<a href="https://www.facebook.com/share/161vabQJzL/" target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>).
              </p>
            </div>
            <div>
              <h3 className="font-bold">3. Issue: Active Session Error</h3>
              <p>
                Solution: Refresh your browser. This issue occurs when you forget to log out, leaving an active session. Refreshing the browser will automatically redirect you to your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-bold">4. Issue: Slow Internet Connection</h3>
              <p>Solution: If you’re experiencing slow loading times or timeouts, try the following:</p>
              <ul className="list-disc pl-5">
                <li>Check your internet connection and try again.</li>
                <li>Refresh the page and attempt the action once more.</li>
                <li>If possible, try connecting to a different network.</li>
                <li>Wait a few minutes and try again later.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">5. Issue: Failed Registration</h3>
              <p>Possible causes:</p>
              <ul className="list-disc pl-5">
                <li>Ensure all required fields are filled out correctly.</li>
                <li>Verify that your password meets the required criteria.</li>
                <li className="font-bold text-red-600">
                  If your registration fails on the first attempt, please contact the developer immediately: Lemuel Tumala Velez (<a href="https://www.facebook.com/share/161vabQJzL/" target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>).
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">6. Issue: Duplicate Student ID Registration Bug</h3>
              <p>
                Description: When a registration attempt fails but the system still saves the student ID, subsequent registrations using the same student ID may cause login errors even if the password is correct. This occurs because the system retains the previously registered student ID, resulting in an invalid credentials error during login.
              </p>
              <p className="mt-2">
                <span className="font-bold text-red-600">Important:</span> Please contact the developer immediately upon your first registration failure: Lemuel Tumala Velez (<a href="https://www.facebook.com/share/161vabQJzL/" target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>).
              </p>
            </div>
            <div>
              <h3 className="font-bold">Note:</h3>
              <ul className="list-disc pl-5">
                <li>Use an active and valid email to avoid recovery issues.</li>
                <li>For the best experience, use Google Chrome or a similar browser.</li>
                <li>Avoid accessing the system directly through Messenger for optimal performance.</li>
                <li>Ensure you have a stable internet connection when using the system.</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

