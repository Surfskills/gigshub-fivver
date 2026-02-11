export default function HomePage() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Get started by editing src/app/page.tsx
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Accounts</h2>
                <p className="text-gray-600">View and manage your accounts</p>
                <a 
                  href="/dashboard/accounts" 
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  Go to Accounts →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Analytics</h2>
                <p className="text-gray-600">Check your analytics data</p>
                <a 
                  href="/dashboard/analytics" 
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  View Analytics →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Reports</h2>
                <p className="text-gray-600">Generate and view reports</p>
                <a 
                  href="/dashboard/reports" 
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  See Reports →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }