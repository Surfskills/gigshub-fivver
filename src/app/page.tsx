import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        
        :root {
          --primary: #2d3748;
          --primary-light: #4a5568;
          --accent: #ed8936;
          --accent-light: #f6ad55;
          --bg: #fafafa;
          --bg-card: #ffffff;
          --text: #1a202c;
          --text-muted: #718096;
          --border: #e2e8f0;
        }
        
        body {
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `
                 linear-gradient(var(--border) 1px, transparent 1px),
                 linear-gradient(90deg, var(--border) 1px, transparent 1px)
               `,
               backgroundSize: '48px 48px'
             }}
        />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-[var(--accent)] opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <header className="px-6 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] rounded-lg flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Mini Gigs Hub
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] -mt-0.5">The Space</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-6 py-12 md:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Column */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 rounded-full border border-[var(--accent)]/20">
                      <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-[var(--accent)]">Internal Operations Platform</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight">
                      Your freelance
                      <span className="block text-[var(--accent)]">operations hub</span>
                    </h2>
                    
                    <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
                      Centralize gig tracking, reporting, and earnings management. 
                      Built for teams who need clarity and control over multiple freelance accounts.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/sign-in"
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--primary-light)] transition-all hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Access Hub
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-card)] text-[var(--text)] font-semibold rounded-lg border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all hover:shadow-md"
                    >
                      Create Account
                    </Link>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[var(--border)]">
                    <div>
                      <div className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>24/7</div>
                      <div className="text-sm text-[var(--text-muted)]">Access</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>∞</div>
                      <div className="text-sm text-[var(--text-muted)]">Accounts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>⚡</div>
                      <div className="text-sm text-[var(--text-muted)]">Fast Sync</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Feature Cards */}
                <div className="space-y-4">
                  <FeatureCard
                    icon="📊"
                    title="Unified Dashboard"
                    description="All your freelance accounts, gigs, and earnings in one view"
                    delay="0s"
                  />
                  <FeatureCard
                    icon="📈"
                    title="Smart Reporting"
                    description="Generate insights and track performance across platforms"
                    delay="0.1s"
                  />
                  <FeatureCard
                    icon="💰"
                    title="Revenue Tracking"
                    description="Monitor earnings, invoices, and payment status centrally"
                    delay="0.2s"
                  />
                  <FeatureCard
                    icon="🔔"
                    title="Real-time Updates"
                    description="Stay informed with notifications for new gigs and milestones"
                    delay="0.3s"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="px-6 py-8 mt-12">
            <div className="max-w-6xl mx-auto border-t border-[var(--border)] pt-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-[var(--text-muted)] text-center">
                  Internal operations platform for freelance management
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Powered by</span>
                    <a 
                      href="https://fred-iota.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors underline decoration-dotted underline-offset-4"
                    >
                      Remote CTIO
                    </a>
                  </div>
                  <span className="hidden sm:inline text-[var(--border)]">•</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('0729007796');
                      alert('Contact number copied!');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group cursor-pointer"
                    title="Click to copy"
                  >
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-mono text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>
                      0729007796
                    </span>
                    <svg className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: string }) {
  return (
    <div 
      className="group p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay} both`
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="flex items-start gap-4">
        <div className="text-3xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[var(--text)] mb-1 group-hover:text-[var(--accent)] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Mini Gigs Hub - The Space',
  description: 'Internal operations platform for freelance management',
};