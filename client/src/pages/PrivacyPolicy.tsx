import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        </div>

        <div className="space-y-6 prose dark:prose-invert prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium">
          <section>
            <p>
              At SnapTrade, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-2">Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Username</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Usage Information</h3>
            <p>We collect data about how you use our service, including:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Chart images you upload</li>
              <li>Analysis results</li>
              <li>Features you use</li>
              <li>Session information</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-2">Payment Information</h3>
            <p>
              When you subscribe to our service, we collect payment information through our payment processor (Stripe). 
              SnapTrade does not store your complete credit card information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process and complete transactions</li>
              <li>To send you service-related notifications</li>
              <li>To improve and personalize your experience</li>
              <li>To develop new features and services</li>
              <li>To monitor and analyze usage patterns</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Storage and Security</h2>
            <p>
              We implement appropriate security measures to protect your information from unauthorized access, alteration, 
              disclosure, or destruction. However, no online transmission or storage system can be guaranteed to be 100% secure.
            </p>
            <p className="mt-4">
              The chart images you upload are stored securely on our servers for the purpose of analysis. We retain these images 
              for a limited period to provide our services and improve our algorithms.
            </p>
            <p className="mt-4">
              User accounts and analysis results are stored in our secure database. We use industry-standard encryption and security protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Sharing and Third Parties</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Service Providers</strong>: Companies that help us provide our service (e.g., payment processors, cloud hosting providers)</li>
              <li><strong>Analytics Partners</strong>: To help us understand how our service is used</li>
              <li><strong>Legal Requirements</strong>: When required by law or to protect our rights</li>
            </ul>
            <p className="mt-4">
              Our service uses the following third-party services:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Stripe for payment processing</li>
              <li>OpenAI API for chart analysis</li>
              <li>News API for sentiment analysis</li>
            </ul>
            <p className="mt-4">
              Each of these services has their own privacy policies that govern how they use data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights and Choices</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Access, correct, or delete your personal information</li>
              <li>Object to the processing of your data</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Close your account</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@snaptrade.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="mt-4">
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Essential cookies</strong>: Necessary for the website to function</li>
              <li><strong>Preference cookies</strong>: Remember your settings and preferences</li>
              <li><strong>Analytics cookies</strong>: Help us understand how visitors interact with our website</li>
              <li><strong>Authentication cookies</strong>: Recognize you so you can log in more easily</li>
            </ul>
            <p className="mt-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, 
              you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
            <p>
              Our service is not intended for use by anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable 
              information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal 
              information, please contact us. If we become aware that we have collected personal information from children without verification of 
              parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
              and updating the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for 
              any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <p className="mt-4">
              privacy@snaptrade.com
            </p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}