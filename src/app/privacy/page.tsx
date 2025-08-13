import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 py-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-red-600">
            Privacy Policy
          </h1>
          <div className="text-lg text-gray-600 mb-6">
            Last updated: August 11, 2025
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              YourNextLease ("Company", "we", "us" or "our") built the YourNextLease website and related services (the "Platform") to help users find and list short-term housing and subleases. This Privacy Policy describes how we collect, use, share, and protect your personal information when you:
            </p>
            <ul className="mt-6 space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Visit or use our Platform
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Register or log in
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Create, view, or respond to listings
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Chat with other users
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Upload images or other media
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                Interact with our customer support
              </li>
            </ul>
            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100">
              <p className="text-gray-800 font-medium">
                By using or accessing the Platform, you consent to the practices described in this policy. If you do not agree, please do not use the Platform.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">1</span>
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">1.1 Information You Provide</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Account Data</h4>
                    <p className="text-gray-600 text-sm">Name, email address, password (securely hashed), profile photo (optional)</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Listing Data</h4>
                    <p className="text-gray-600 text-sm">Property title, description, rent, dates, location, preferences, contact details</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Media</h4>
                    <p className="text-gray-600 text-sm">Photos you upload via Cloudinary</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Messages</h4>
                    <p className="text-gray-600 text-sm">Chat content when communicating with other users</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">1.2 Information Collected Automatically</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Usage Data</h4>
                    <p className="text-gray-600 text-sm">Pages visited, time stamps, actions taken, error logs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Device & Browser Data</h4>
                    <p className="text-gray-600 text-sm">IP address, device type, operating system, browser version</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-2">Analytics</h4>
                    <p className="text-gray-600 text-sm">Google Analytics events (pageviews, sign-ups, etc.)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">1.3 Cookies & Similar Technologies</h3>
                <p className="text-gray-700">We use essential cookies for session management and optional cookies for analytics. You can manage cookie preferences in your browser settings.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">2</span>
              How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-6">We process your data to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Operate & improve the Platform (authentication, listings, chat)</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Communicate with you (emails about your listings, support responses)</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Analyze usage to enhance features and fix bugs</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Secure the Platform against abuse and fraud</span>
              </div>
              <div className="flex items-start md:col-span-2">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Comply with legal obligations</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">3</span>
              How We Share Your Information
            </h2>
            <p className="text-gray-700 mb-6">We do not sell your personal data. We may share information with:</p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Service Providers</h4>
                <p className="text-gray-600">Cloudinary (image hosting), Firebase (auth & database), Vercel (hosting), Google Analytics (analytics)</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Legal Authorities</h4>
                <p className="text-gray-600">If required by law or to protect our rights</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Business Transfers</h4>
                <p className="text-gray-600">In case of a merger or acquisition, subject to confidentiality</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">4</span>
              Data Retention
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Account & Profile Data</h4>
                <p className="text-gray-600">Retained until you delete your account</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Listings & Messages</h4>
                <p className="text-gray-600">Retained for the duration you leave them active, plus 90 days after deletion</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Analytics & Logs</h4>
                <p className="text-gray-600">Aggregated/anonymous data retained indefinitely; raw logs kept up to 6 months</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">5</span>
              Your Rights & Choices
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">5.1 Access & Correction</h3>
                <p className="text-gray-700">You can view or update your profile and listing data at any time by logging into Profile → Account Settings.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">5.2 Deletion</h3>
                <p className="text-gray-700">To delete your account and associated data, go to Profile → Delete Account or email info@yournextlease.com. We will process your request within 30 days; some data may remain in backups for up to 90 days.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">5.3 Marketing Opt-Out</h3>
                <p className="text-gray-700">You may opt out of non-transactional emails by clicking "Unsubscribe" in any marketing email.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">6</span>
              Security
            </h2>
            <p className="text-gray-700 mb-6">We implement reasonable technical and organizational measures:</p>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Encryption for data in transit (HTTPS)</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Hashed passwords (bcrypt)</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Access controls on our databases and servers</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">However, no system is impervious to attack; please share only information you're comfortable with publicly.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">7</span>
              Children's Privacy
            </h2>
            <p className="text-gray-700">We do not knowingly collect data from anyone under 18. If you believe we have erroneously collected information of a minor, please contact us at support@yournextlease.com for prompt deletion.</p>
          </section>

          {/* Section 8 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">8</span>
              International Transfers
            </h2>
            <p className="text-gray-700">Our servers and service providers may be located outside your country. By using the Platform, you consent to transfer of your information to the United States, where our data processors operate.</p>
          </section>

          {/* Section 9 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">9</span>
              Changes to This Policy
            </h2>
            <p className="text-gray-700">We may update this Privacy Policy. We'll post the new version here with a revised "Last updated" date. Significant changes will also be announced via email when possible.</p>
          </section>

          {/* Section 10 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">10</span>
              Contact Us
            </h2>
            <p className="text-gray-700 mb-6">If you have questions or requests regarding this policy, please contact us:</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-800 mb-2">YourNextLease</h3>
              <p className="text-gray-700">
                Email: <a href="mailto:info@yournextlease.com" className="text-red-600 hover:text-red-700 underline">info@yournextlease.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 