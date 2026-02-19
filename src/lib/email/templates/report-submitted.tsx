import { Html, Head, Body, Container, Section, Text, Hr, Heading } from '@react-email/components';

interface ReportSubmittedEmailProps {
  accountName: string;
  reportDate: string;
  shift: string;
  submittedBy: string;
}

export function ReportSubmittedEmail({
  accountName,
  reportDate,
  shift,
  submittedBy,
}: ReportSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📋 Shift Report Submitted</Heading>
          <Text style={text}>
            A new shift report has been submitted for <strong>{accountName}</strong>.
          </Text>

          <Section style={reportSection}>
            <Text style={label}>Report date</Text>
            <Text style={value}>{reportDate}</Text>
            <Text style={label}>Shift</Text>
            <Text style={value}>{shift}</Text>
            <Text style={label}>Submitted by</Text>
            <Text style={value}>{submittedBy}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated notification from Mini Gigs Hub. View the report in the dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 24px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 24px',
};

const reportSection = {
  padding: '16px 24px',
  backgroundColor: '#f0fdf4',
  margin: '16px 24px',
  borderRadius: '8px',
  borderLeft: '4px solid #22c55e',
};

const label = {
  margin: '0 0 4px 0',
  fontSize: '12px',
  color: '#666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const value = {
  margin: '0 0 12px 0',
  fontSize: '16px',
  color: '#333',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 24px',
};
