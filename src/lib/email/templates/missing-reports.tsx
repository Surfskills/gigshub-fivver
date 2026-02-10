import { Html, Head, Body, Container, Section, Text, Hr, Heading } from '@react-email/components';

interface MissingReportsEmailProps {
  missingReports: {
    platform: string;
    username: string;
    missingShifts: string[];
  }[];
  date: string;
}

export function MissingReportsEmail({ missingReports, date }: MissingReportsEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Missing Shift Reports</Heading>
          <Text style={text}>
            The following accounts are missing shift reports for <strong>{date}</strong>:
          </Text>

          {missingReports.map((report, idx) => (
            <Section key={idx} style={reportSection}>
              <Text style={accountText}>
                <strong>{report.platform.toUpperCase()}</strong> - {report.username}
              </Text>
              <Text style={shiftsText}>Missing shifts: {report.missingShifts.join(', ')}</Text>
            </Section>
          ))}

          <Hr style={hr} />
          <Text style={footer}>
            This is an automated alert from your Freelance Operations Brain. Please submit the missing reports as soon
            as possible.
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
  padding: '12px 24px',
  backgroundColor: '#fff5f5',
  marginBottom: '12px',
  borderLeft: '4px solid #ef4444',
};

const accountText = {
  margin: '0 0 4px 0',
  fontSize: '16px',
  color: '#333',
};

const shiftsText = {
  margin: '0',
  fontSize: '14px',
  color: '#666',
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
