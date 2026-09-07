import { Resend } from 'resend';
import { alertRecipients, alertsConfigured, mailFrom, resendApiKey } from '@/lib/env';

export type AlertSeverity = 'critical' | 'action_required' | 'warning' | 'info';

export type OperatorAlert = {
  severity: AlertSeverity;
  subject: string;
  body: string;
  participantCode?: string;
};

export type DeliveryResult = { delivered: boolean; detail: string };

function render(alert: OperatorAlert): string {
  const lines = [
    `Severity: ${alert.severity.toUpperCase()}`,
    alert.participantCode ? `Participant: ${alert.participantCode}` : null,
    `Time: ${new Date().toISOString()}`,
    '',
    alert.body,
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Sends an operational alert to the Genius Mining alert group.
 *
 * Never throws. Callers use this on paths where the alert is the safety net —
 * a de-identification failure blocks a purge and alerts — so an alert that
 * itself failed must not take down the caller's error handling. It always logs,
 * so an undelivered alert is still recoverable from the platform logs.
 */
export async function sendOperatorAlert(alert: OperatorAlert): Promise<DeliveryResult> {
  const body = render(alert);
  const subject = `[Genius Mining] ${alert.subject}`;

  const logLine = `${subject}\n${body}`;
  if (alert.severity === 'critical' || alert.severity === 'action_required') {
    console.error(logLine);
  } else {
    console.warn(logLine);
  }

  if (!alertsConfigured()) {
    return {
      delivered: false,
      detail: 'RESEND_API_KEY is not set; the alert was logged only.',
    };
  }

  try {
    const resend = new Resend(resendApiKey());
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: alertRecipients(),
      subject,
      text: body,
    });

    if (error) {
      console.error(`[Genius Mining] alert delivery failed: ${error.message}`);
      return { delivered: false, detail: error.message };
    }

    return { delivered: true, detail: `Sent to ${alertRecipients().join(', ')}.` };
  } catch (error) {
    const detail = (error as Error).message;
    console.error(`[Genius Mining] alert delivery threw: ${detail}`);
    return { delivered: false, detail };
  }
}

/**
 * The day-7 and day-25 warnings before identified data is deleted.
 *
 * The copy states plainly that deletion is permanent and that coming back means
 * retaking the questionnaire, because a student who reads this and assumes their
 * answers are recoverable has been misled.
 */
export async function sendRetentionWarning(options: {
  to: string;
  day: 7 | 25;
  daysUntilPurge: number;
}): Promise<DeliveryResult> {
  const { to, day, daysUntilPurge } = options;

  const subject =
    day === 7
      ? 'Your Genius Mining profile will be deleted in 23 days'
      : `Last reminder: your Genius Mining profile is deleted in ${daysUntilPurge} days`;

  const body = [
    'Your CampusQuest membership has ended, so your Genius Mining profile, your saved',
    `answers and your recommendations are scheduled for deletion in ${daysUntilPurge} days.`,
    '',
    'Deletion is permanent. If you come back later you take the questionnaire again from',
    "the start — we won't have your old answers to restore.",
    '',
    'If you downloaded or printed your profile, that copy is yours and stays yours.',
    '',
    'Restarting your membership before then cancels the deletion and nothing is lost.',
    '',
    'The anonymized copy described when you started is not part of this deletion. It holds the',
    'structure of your answers and none of the words you wrote, carries no name or email, and is',
    'kept to improve the questionnaire.',
  ].join('\n');

  if (!alertsConfigured()) {
    console.warn(`[Genius Mining] would email ${to}: ${subject}`);
    return { delivered: false, detail: 'RESEND_API_KEY is not set; the warning was logged only.' };
  }

  try {
    const resend = new Resend(resendApiKey());
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: [to],
      subject,
      text: body,
    });

    if (error) return { delivered: false, detail: error.message };
    return { delivered: true, detail: `Sent to ${to}.` };
  } catch (error) {
    return { delivered: false, detail: (error as Error).message };
  }
}
