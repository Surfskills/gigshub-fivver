'use client';

import Link from 'next/link';

export default function HomePageClient() {
  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0729007796');
    alert('Contact number copied!');
  };

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

      <div className="min-h-screen bg-[var(--bg)] relative overflow-x-hidden">
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
                    icon="👥"
                    title="Multiple Freelance Accounts Management"
                    description="Manage and track multiple freelance accounts across Fiverr, Upwork, and direct clients in one place"
                    delay="0.05s"
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

          {/* FAQ Section */}
          <section
            className="px-6 py-12 md:py-16"
            aria-label="Frequently asked questions"
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-8 md:mb-12 text-center">
                Frequently asked questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    q: 'What is Mini Gigs Hub?',
                    a: 'Mini Gigs Hub is an operations and reporting dashboard for managing multiple freelancing accounts across Fiverr, Upwork, and direct clients. It provides shift-based reporting, earnings tracking, analytics, and automated email alerts for missing reports.',
                  },
                  {
                    q: 'Which platforms does Mini Gigs Hub support?',
                    a: 'Mini Gigs Hub supports Fiverr, Upwork, and direct client accounts. You can track gigs, earnings, and performance across all platforms in one place.',
                  },
                  {
                    q: 'How does shift reporting work?',
                    a: 'Users submit AM and PM shift reports for each account daily. The system tracks earnings, orders completed, and available balance per shift. Automated alerts notify you when reports are missing.',
                  },
                  {
                    q: 'Is Mini Gigs Hub free to use?',
                    a: 'No, the platform is not free. Contact admin to discuss your account setup.',
                  },
                  {
                    q: 'What features does Mini Gigs Hub include?',
                    a: 'Features include an analytics dashboard with balance trends, account management, shift reporting, financial records, CSV exports, and automated email alerts for missing reports. Role-based access (Admin and Operator) is supported.',
                  },
                ].map((faq) => (
                  <div
                    key={faq.q}
                    className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                  >
                    <h3 className="font-semibold text-[var(--text)] mb-2">{faq.q}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section
            className="px-6 py-12 md:py-16 bg-[var(--bg)]"
            aria-label="Pricing packages"
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-4 text-center">
                Simple pricing by accounts
              </h2>
              <p className="text-[var(--text-muted)] text-center mb-10 md:mb-12 max-w-2xl mx-auto">
                Choose the plan that fits your team size. All plans include the core features.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                  // KES is source of truth; USD derived via KES/USD rate (~130 KES = 1 USD)
                  const KES_TO_USD = Number(process.env.NEXT_PUBLIC_KES_TO_USD_RATE) || 130;
                  const kesToUsd = (kes: number) =>
                    (kes / KES_TO_USD).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    });
                  return [
                    {
                      name: 'Starter',
                      accounts: '1–3 accounts',
                      target: 'Solo freelancers',
                      kes: 1500,
                      period: '/month',
                      features: ['Unified dashboard', 'Shift reporting', 'Earnings tracking', 'Email alerts', 'CSV export'],
                      popular: false,
                    },
                    {
                      name: 'Growth',
                      accounts: '4–10 accounts',
                      target: 'Multi-account freelancers',
                      kes: 5000,
                      period: '/month',
                      features: ['Everything in Starter', 'Analytics dashboard', 'Financial records', 'Role-based access', 'Priority support'],
                      popular: true,
                    },
                    {
                      name: 'Scale',
                      accounts: '11–25 accounts',
                      target: 'Agencies & teams',
                      kes: 8000,
                      period: '/month',
                      features: ['Everything in Growth', 'Higher report volume', 'Multiple operators', 'Dedicated onboarding'],
                      popular: false,
                    },
                    {
                      name: 'Enterprise',
                      accounts: '26+ accounts',
                      target: 'Large teams',
                      kes: null,
                      period: '',
                      features: ['Everything in Scale', 'Custom account limits', 'Dedicated support', 'Custom integrations'],
                      popular: false,
                    },
                  ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-xl border-2 p-6 flex flex-col ${
                      plan.popular
                        ? 'border-[var(--accent)] bg-[var(--bg-card)] shadow-lg ring-2 ring-[var(--accent)]/20'
                        : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-full">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-[var(--text)]">{plan.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{plan.accounts}</p>
                    <p className="text-xs text-[var(--text-muted)] -mt-0.5">{plan.target}</p>
                    <div className="mt-4 mb-4">
                      <span className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "'Space Mono', monospace" }}>
                        {plan.kes === null ? 'Custom' : `KES ${plan.kes.toLocaleString()}`}
                      </span>
                      {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
                      {plan.kes !== null && (
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">
                          or USD {kesToUsd(plan.kes)}{plan.period}
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                          <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="https://wa.me/254759530335"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        plan.popular
                          ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-light)]'
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Contact admin
                    </a>
                  </div>
                ));
                })()}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="px-6 py-8 mt-12">
            <div className="max-w-6xl mx-auto border-t border-[var(--border)] pt-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-[var(--text-muted)] text-center">
                  Internal operations platform for freelance management
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Managed by</span>
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
                  <a
                    href="https://wa.me/254759530335"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all group cursor-pointer"
                    title="Contact admin on WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="font-semibold">+254 759 530 335</span>
                  </a>
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