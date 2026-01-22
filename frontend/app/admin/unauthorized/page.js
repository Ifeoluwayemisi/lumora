"use client";

import Link from "next/link";
import { AdminButton } from "@/components/admin/AdminComponents";
import { FiLock, FiArrowLeft } from "react-icons/fi";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <FiLock size={40} className="text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Your current role
            doesn't grant the required access level.
          </p>

          {/* Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm font-semibold text-red-900 mb-2">
              What you can do:
            </p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Contact your administrator to request access</li>
              <li>• Return to the dashboard and try another page</li>
              <li>• Check your account role and permissions</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/admin/dashboard">
              <AdminButton className="w-full">
                <FiArrowLeft size={18} />
                Back to Dashboard
              </AdminButton>
            </Link>
            <Link href="/admin/profile">
              <AdminButton variant="outline" className="w-full">
                View Your Profile
              </AdminButton>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact support with error
            code: 403-UNAUTHORIZED
          </p>
        </div>
      </div>
    </div>
  );
}
