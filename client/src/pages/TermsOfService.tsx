import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        </div>

        <div className="space-y-6 prose dark:prose-invert prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium">
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to SnapTrade. These Terms of Service govern your use of our website and services.
              By accessing or using SnapTrade, you agree to be bound by these Terms.
              If you disagree with any part of the terms, you do not have permission to access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Financial Disclaimer</h2>
            <p>
              <strong className="text-destructive">
                THE INFORMATION PROVIDED BY SNAPTRADE IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE FINANCIAL ADVICE.
              </strong>
            </p>
            <p>
              All chart analyses, pattern identifications, and market predictions are generated using artificial intelligence
              and should not be considered as professional trading advice. The predictions, analyses, and recommendations
              provided by our service:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                Are not financial advice and should not be treated as such
              </li>
              <li>
                Do not guarantee future market performance or results
              </li>
              <li>
                Should be considered as one of many tools in your trading strategy
              </li>
              <li>
                May not account for all market variables or unforeseen events
              </li>
              <li>
                Should be verified with additional research and analysis
              </li>
            </ul>
            <p className="mt-4">
              You acknowledge that any investment decisions you make are at your own risk, and SnapTrade will
              not be held liable for any losses or damages resulting from the use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Service Description</h2>
            <p>
              SnapTrade provides AI-powered analysis of trading charts through pattern recognition and market sentiment analysis.
              Our service allows users to upload images of trading charts and receive automated analyses including:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Technical pattern identification</li>
              <li>News sentiment analysis</li>
              <li>Potential trade setups with entry/exit points</li>
              <li>Risk-reward calculations</li>
            </ul>
            <p className="mt-4">
              These features are provided on a subscription basis, with certain limitations for free users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Risk Disclosure</h2>
            <p>
              Trading in financial markets involves substantial risk. Past performance is not indicative of future results.
              The high degree of leverage that is often obtainable in financial trading can work against you as well as for you.
            </p>
            <p className="mt-4">
              You should be aware of all the risks associated with trading and seek advice from an independent financial advisor
              if you have any doubts. No representation is being made that any account will or is likely to achieve profits or
              losses similar to those discussed on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. User Accounts</h2>
            <p>
              When you create an account with us, you guarantee that the information you provide is accurate, complete, and current.
              Inaccurate, incomplete, or obsolete information may result in the termination of your account.
            </p>
            <p className="mt-4">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
              You agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Subscription and Payments</h2>
            <p>
              SnapTrade offers subscription-based services at the following rates:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Monthly subscription: £59 per month</li>
              <li>Annual subscription: £349 per year</li>
            </ul>
            <p className="mt-4">
              Subscriptions are automatically renewed unless canceled at least 24 hours before the end of the current period.
              Refunds are not provided for partial subscription periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of SnapTrade.
              The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least
              30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@snaptrade.com.
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