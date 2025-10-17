import FeedbackDashboard from '../../../../components/FeedbackDashboard';

/**
 * Admin page to monitor feedback and performance metrics.
 * Renders the `FeedbackDashboard` component which reads from Firestore.
 */

export default function FeedbackAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor user feedback and system performance
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <FeedbackDashboard />
    </div>
  );
} 