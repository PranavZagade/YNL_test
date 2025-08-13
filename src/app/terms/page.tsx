import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 py-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-red-600">
            Terms and Conditions
          </h1>
          <div className="text-lg text-gray-600 mb-6">
            Last updated: 11 August, 2025
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Welcome to YourNextLease. By accessing or using our website (the "Platform"), you agree to be bound by the following Terms and Conditions (the "Terms"). If you do not agree with any part of these Terms, please do not use the Platform.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              These Terms constitute a legal agreement between you ("User", "you", or "your") and YourNextLease ("Company", "we", "us", or "our").
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">1</span>
              Eligibility
            </h2>
            <p className="text-gray-700">You must be at least 18 years of age to use this Platform. By using the Platform, you represent and warrant that you meet this eligibility requirement and that you have the legal capacity to enter into this agreement.</p>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">2</span>
              Platform Purpose
            </h2>
            <p className="text-gray-700">YourNextLease is a listing platform designed to help users find or post sublease and housing opportunities, primarily targeting students and short-term renters. We do not provide or manage rental properties, nor are we a real estate broker, agent, or legal representative of either party involved in any transaction.</p>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">3</span>
              Account Registration
            </h2>
            <p className="text-gray-700 mb-6">To access certain features of the Platform, you may be required to create an account. You agree to:</p>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Provide accurate, current, and complete information.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Maintain the confidentiality of your login credentials.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Accept responsibility for all activities that occur under your account.</span>
              </div>
            </div>
            <p className="text-gray-700 mt-6">We reserve the right to suspend or terminate any account at our sole discretion.</p>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">4</span>
              User-Generated Content
            </h2>
            <p className="text-gray-700 mb-6">Users may submit property listings, images, descriptions, contact details, and other content. By submitting content:</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">You grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on the Platform.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">You confirm that you own or have the right to use the content.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">You agree not to submit false, misleading, defamatory, or illegal content.</span>
              </div>
            </div>
            <p className="text-gray-700">We reserve the right (but not the obligation) to review, remove, or modify user content at our sole discretion.</p>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">5</span>
              Prohibited Activities
            </h2>
            <p className="text-gray-700 mb-6">You agree not to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Posting false, misleading, or fraudulent listings</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Impersonating another person or misrepresenting your affiliation</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Providing inaccurate contact or housing information</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Discriminatory or abusive behavior towards other users</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Spamming or sending unsolicited communications</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Attempting to scrape, copy, or access platform data without authorization</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Posting listings that are not related to legitimate housing/sublease</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Attempting to bypass payment or verification systems</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Sharing or publishing private or personal information of others</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Uploading malicious content (e.g. viruses, malware, phishing links)</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Violating any local, state, or federal housing laws</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Using the platform for illegal or unauthorized purposes</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Engaging in harassment, threats, or hateful speech</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Offering housing in exchange for unlawful favors</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Interfering with platform security or operations</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Collecting personal data from users without consent</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Posting third-party content without proper rights or permissions</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Using bots, scripts, or automation to interact with the platform</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Soliciting payments or deposits off-platform in a suspicious manner</span>
              </div>
              <div className="flex items-start md:col-span-2">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700 text-sm">Listing properties that you do not have permission to rent or sublet</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">6</span>
              Third-Party Links
            </h2>
            <p className="text-gray-700">The Platform may include links to third-party websites (e.g., MapBox). These are provided for convenience and informational purposes only. We have no control over and assume no responsibility for the content, policies, or practices of any third-party site or service.</p>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">7</span>
              Limitation of Liability
            </h2>
            <p className="text-gray-700 mb-6">To the maximum extent permitted by law, YourNextLease and its founders, affiliates, and employees shall not be liable for:</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Any indirect, incidental, special, consequential, or punitive damages.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Loss of profits, data, use, goodwill, or other intangible losses.</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Any damages resulting from the use or inability to use the Platform, even if we have been advised of the possibility of such damages.</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-800 text-sm font-medium">Our total liability for any claim arising from or relating to this Agreement or the Platform shall be capped at $1 USD.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">8</span>
              Disclaimers
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">No Guarantee</h4>
                <p className="text-gray-600">We do not guarantee the accuracy, completeness, or reliability of listings or user-submitted content.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">No Responsibility</h4>
                <p className="text-gray-600">We are not a party to any rental or lease agreement. All agreements are solely between users.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Use at Your Own Risk</h4>
                <p className="text-gray-600">You assume all risks associated with using the Platform and interacting with other users.</p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">9</span>
              Indemnification
            </h2>
            <p className="text-gray-700">You agree to defend, indemnify, and hold harmless YourNextLease, its owners, employees, and affiliates from any claims, damages, liabilities, losses, or expenses (including attorney's fees) arising out of:</p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Your use of the Platform,</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Your violation of these Terms,</span>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">Your violation of any rights of another person or entity.</span>
              </div>
            </div>
        </section>

          {/* Section 10 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">10</span>
              Modifications to the Platform
            </h2>
            <p className="text-gray-700">We may change, suspend, or discontinue any part of the Platform at any time, without notice or liability.</p>
        </section>

          {/* Section 11 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">11</span>
              Termination
            </h2>
            <p className="text-gray-700">We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
        </section>

          {/* Section 12 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">12</span>
              Privacy
            </h2>
            <p className="text-gray-700">Your use of the Platform is also governed by our <a href="/privacy" className="text-red-600 hover:text-red-700 underline">Privacy Policy</a>, which outlines how we collect, use, and protect your personal data.</p>
        </section>

          {/* Section 13 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">13</span>
              Governing Law and Jurisdiction
            </h2>
            <p className="text-gray-700">These Terms are governed by the laws of the State of Arizona, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in Maricopa County, Arizona.</p>
        </section>

          {/* Section 14 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">14</span>
              Entire Agreement
            </h2>
            <p className="text-gray-700">These Terms constitute the entire agreement between you and YourNextLease concerning the use of the Platform and supersede all prior communications and proposals.</p>
        </section>

          {/* Section 15 */}
          <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">15</span>
              Contact Us
            </h2>
            <p className="text-gray-700 mb-6">For any questions regarding these Terms, please contact us at:</p>
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