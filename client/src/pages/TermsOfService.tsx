import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 15, 2025</p>
        </div>

        <div className="space-y-6 prose dark:prose-invert prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium">
          <section>
            <p>
              Welcome to SnapTrade. By accessing or using our website and services, you agree to be bound by the following Terms and Conditions. 
              If you do not agree with any part of these terms, please do not use SnapTrade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Educational Purpose Only — Not Financial Advice</h2>
            <p>
              SnapTrade is designed purely for educational and informational purposes. All content, tools, predictions, and analyses provided on this platform, 
              including but not limited to chart pattern recognition and news sentiment analysis, are intended to help users learn and explore financial markets.
            </p>
            <p className="mt-4">
              <strong className="text-destructive">
                Nothing provided by SnapTrade constitutes financial, investment, or trading advice.
              </strong>
            </p>
            <p className="mt-4">
              We are not a licensed financial advisor, broker, or investment firm. You should consult a qualified financial professional before making any 
              trading or investment decisions.
            </p>
            <p className="mt-4">
              SnapTrade disclaims any liability for losses incurred as a result of using any of our tools or acting on any information provided by our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Subscription and Billing</h2>
            <p>
              SnapTrade offers subscription-based features on Standard and Premium tiers.
            </p>
            <p className="mt-4">
              You may cancel your subscription at any time. Once cancelled, you will not be billed again.
            </p>
            <p className="mt-4">
              <strong className="text-destructive">
                All subscriptions are non-refundable. No partial or prorated refunds will be provided under any circumstances.
              </strong>
            </p>
            <p className="mt-4">
              By subscribing to SnapTrade services, you acknowledge and agree to this strict no-refund policy. However, you will retain full access to premium features 
              for the remainder of the billing cycle that has already been paid.
            </p>
            <p className="mt-4">
              Please ensure you understand your subscription billing terms before purchasing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Conduct</h2>
            <p>
              By using SnapTrade, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Use the service legally and responsibly.</li>
              <li>Not upload harmful, abusive, or illegal content.</li>
              <li>Not attempt to reverse-engineer, copy, or interfere with the website's functionality or services.</li>
              <li>Refrain from using automated bots or scraping technologies on the platform.</li>
            </ul>
            <p className="mt-4">
              We reserve the right to terminate access to users who violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Trading Signals Marketplace</h2>
            <p>
              SnapTrade provides a platform for users to share trading signals with the community. All users can view free signals, while paid signals 
              require a separate payment to the signal provider.
            </p>
            <p className="mt-4">
              <strong>Signal Provider Terms:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>All users may provide free trading signals through our platform.</li>
              <li>Only subscribers to our Standard or Premium plans may offer paid trading signals.</li>
              <li>Signal providers set their own monthly subscription prices for access to their signals.</li>
              <li>A service fee of <strong>15%</strong> is retained by SnapTrade from all revenue generated through paid signals.</li>
              <li>Payments are processed through our platform using Stripe, and providers receive payouts according to our payment schedule.</li>
              <li>Providers are responsible for the quality, accuracy, and legality of their signal content.</li>
              <li>SnapTrade reserves the right to remove any signals or suspend provider accounts that violate our terms.</li>
            </ul>
            <p className="mt-4">
              <strong>Signal Recipient Terms:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Signals are provided for educational and informational purposes only and do not constitute financial advice.</li>
              <li>SnapTrade does not guarantee the accuracy or profitability of any signals shared on the platform.</li>
              <li>Subscription payments for paid signals are non-refundable once processed.</li>
              <li>Users subscribe to signals at their own risk and are solely responsible for their trading decisions.</li>
            </ul>
            <p className="mt-4">
              <strong className="text-amber-500">
                Trading signals, whether free or paid, are created by individual users, not by SnapTrade. 
                We do not endorse any particular signals or providers.
              </strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Image Upload and Data Handling</h2>
            <p>
              SnapTrade allows users to upload chart images for analysis. By uploading an image:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>You confirm you have the right to use and share that image.</li>
              <li>You grant us a limited license to process the image using our software.</li>
              <li>We do not sell or distribute uploaded images or user data to third parties.</li>
            </ul>
            <p className="mt-4">
              For more details on how we handle data, please refer to our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property</h2>
            <p>
              All content and services provided on SnapTrade, including logos, models, algorithms, text, and visuals, 
              are the intellectual property of SnapTrade or its licensors. Unauthorized reproduction, redistribution, 
              or commercial use is prohibited without explicit written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. AI Analysis Variability and Results</h2>
            <p>
              SnapTrade utilizes artificial intelligence to analyze charts and news sentiment. By using our platform, you acknowledge and accept:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Varying Results:</strong> The same chart or data may produce different analysis results each time it is processed due to:
                <ul className="list-disc pl-6 mt-2 mb-2">
                  <li>The inherent non-deterministic nature of AI models</li>
                  <li>Real-time news sentiment integration that may change between analyses</li>
                  <li>Varying pattern recognition confidence levels</li>
                  <li>Random sampling elements in AI processing</li>
                  <li>Combined weighting of multiple analysis factors</li>
                </ul>
              </li>
              <li>This variability is by design and mirrors how different professional traders might interpret the same chart differently.</li>
              <li>Historical accuracy statistics provided are approximations and not guarantees of future performance.</li>
              <li>All analyses should be considered as one of multiple possible interpretations rather than definitive conclusions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SnapTrade and its operators shall not be liable for any direct, 
              indirect, incidental, or consequential damages arising from:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Use or misuse of the platform.</li>
              <li>Inaccuracies or errors in pattern detection or news analysis.</li>
              <li>Variability in AI analysis results as described in Section 7.</li>
              <li>Trading decisions made based on SnapTrade outputs.</li>
            </ul>
            <p className="mt-4">
              Use of SnapTrade is entirely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to These Terms</h2>
            <p>
              SnapTrade may update these Terms and Conditions at any time. Continued use of the site after changes 
              constitutes your acceptance of the revised terms. We recommend reviewing this page periodically.
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