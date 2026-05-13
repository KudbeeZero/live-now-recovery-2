/**
 * Admin email notification helpers.
 * All functions are fire-and-forget — they never throw or block the
 * calling action. Failures are logged to console.warn only.
 */

async function sendAdminEmail(subject: string, body: string): Promise<void> {
  try {
    await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "admin@livenowrecovery.org", subject, body }),
    });
  } catch (err) {
    console.warn("[AdminNotify] Email send failed:", err);
  }
}

type NotifyEventType =
  | "newProvider"
  | "newVolunteer"
  | "newReport"
  | "newCredential";

type NotifPrefsActor = {
  getAdminNotificationPrefs: () => Promise<{
    notifyOnNewProvider: boolean;
    notifyOnNewReport: boolean;
    notifyOnNewCredential: boolean;
    notifyOnNewVolunteer: boolean;
  }>;
};

const EVENT_TO_PREF: Record<
  NotifyEventType,
  keyof Awaited<ReturnType<NotifPrefsActor["getAdminNotificationPrefs"]>>
> = {
  newProvider: "notifyOnNewProvider",
  newVolunteer: "notifyOnNewVolunteer",
  newReport: "notifyOnNewReport",
  newCredential: "notifyOnNewCredential",
};

export async function notifyAdminIfEnabled(
  actor: NotifPrefsActor,
  eventType: NotifyEventType,
  subject: string,
  body: string,
): Promise<void> {
  try {
    const prefs = await actor.getAdminNotificationPrefs();
    const prefKey = EVENT_TO_PREF[eventType];
    if (prefs[prefKey]) {
      await sendAdminEmail(subject, body);
    }
  } catch (err) {
    console.warn("[AdminNotify] Notification check failed:", err);
  }
}
