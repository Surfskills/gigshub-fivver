import nodemailer from 'nodemailer';
import React from 'react';
import { render } from '@react-email/render';
import { MissingReportsEmail } from './templates/missing-reports';

const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || 'ojjfred@gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'ojjfred@gmail.com';
const SMTP_PASSWORD = (process.env.SMTP_PASSWORD || '').replace(/\s/g, '');

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendMissingReportsAlert(
  _to: string[],
  missingReports: {
    platform: string;
    username: string;
    missingShifts: string[];
  }[],
  date: string
): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  try {
    if (!SMTP_PASSWORD) {
      console.error('SMTP_PASSWORD is not set. Add it to .env');
      return { success: false, error: 'SMTP not configured' };
    }

    const html = await render(
      React.createElement(MissingReportsEmail, { missingReports, date })
    );

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"Mini Gigs Hub Alerts" <${SMTP_USER}>`,
      to: ALERT_EMAIL_TO,
      subject: `⚠️ Missing Shift Reports - ${date}`,
      html,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}
