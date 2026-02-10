import { Resend } from 'resend';
import { MissingReportsEmail } from './templates/missing-reports';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMissingReportsAlert(
  to: string[],
  missingReports: {
    platform: string;
    username: string;
    missingShifts: string[];
  }[],
  date: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Ops Brain <alerts@yourdomain.com>',
      to,
      subject: `⚠️ Missing Shift Reports - ${date}`,
      react: MissingReportsEmail({ missingReports, date }),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}
