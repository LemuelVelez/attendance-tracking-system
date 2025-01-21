import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ErrorInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">View Common Errors and Solutions</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs lg:max-w-sm">
        <DialogHeader>
          <DialogTitle>Frequent Errors and Solutions</DialogTitle>
          <DialogDescription>
            USE GOOGLE CHROME OR ANY OTHER BROWSER FOR OPTIMAL EXPERIENCE.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">
                1. Issue: User Not Found & ERROR DURING SIGN UP/REGISTRATION.
              </h3>
              <p>
                Solution: Go back to the signup page, register again, and make
                sure to use an active and another valid email address not the
                email address you use recently to sign up. Do not use a dummy
                email, as password recovery and reset instructions will be sent
                to your active email if needed.
              </p>
            </div>
            <div>
              <h3 className="font-bold">2. Issue: Invalid Email or Password</h3>
              <p>
                Primary Solution: Double-check your password for accuracy, then
                try logging in again.
              </p>
              <p>
                Secondary Solution: If the issue persists, sign up again using a
                different email. Make sure the email is active and valid to
                ensure you can recover and reset your password if necessary.
              </p>
            </div>
            <div>
              <h3 className="font-bold">3. Issue: Active Session Error</h3>
              <p>
                Solution: Refresh your browser. This issue occurs when you
                forget to log out, leaving an active session. Refreshing the
                browser will automatically redirect you to your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Note:</h3>
              <ul className="list-disc pl-5">
                <li>Use an active and valid email to avoid recovery issues.</li>
                <li>
                  For the best experience, use Google Chrome or a similar
                  browser.
                </li>
                <li>
                  Avoid accessing the system directly through Messenger for
                  optimal performance.
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
