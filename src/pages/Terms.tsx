import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <title>Terms & Conditions | Retreats Holidays</title>
      <meta name="description" content="Read our terms of service and privacy policy for using Retreats Holidays services." />
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using our services
            </p>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-display font-bold text-foreground mb-8">
              Terms of Service
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using Retreats Holidays services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">2. Services Description</h3>
                <p>
                  Retreats Holidays provides curated wellness retreat experiences, including yoga retreats, meditation retreats, and holistic wellness programs. We act as an intermediary between retreat organizers and customers, facilitating bookings and providing information about various retreat options.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">3. Booking and Payments</h3>
                <p>
                  All bookings are subject to availability. Payment terms vary depending on the retreat and will be clearly communicated at the time of booking. Deposits may be required to secure your reservation. Full payment is typically due before the retreat start date.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">4. Cancellation Policy</h3>
                <p>
                  Cancellation policies vary by retreat. Please review the specific cancellation terms for your chosen retreat before booking. In general, cancellations made well in advance may be eligible for refunds or credits, while late cancellations may incur fees.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">5. User Responsibilities</h3>
                <p>
                  Users are responsible for providing accurate personal information, maintaining the confidentiality of their account, and ensuring they meet any health or physical requirements for their chosen retreat. Participants should consult with healthcare providers before engaging in physical activities.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h3>
                <p>
                  Retreats Holidays shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid for the specific service in question.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">7. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-display font-bold text-foreground mb-8">
              Privacy Policy
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h3>
                <p>
                  We collect information you provide directly, including name, email address, phone number, and payment information. We also collect usage data, device information, and cookies to improve our services.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h3>
                <p>
                  Your information is used to process bookings, communicate about retreats, send promotional materials (with consent), improve our services, and comply with legal obligations. We do not sell your personal information to third parties.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">3. Data Security</h3>
                <p>
                  We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We encourage users to take precautions when sharing personal information online.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">4. Cookies and Tracking</h3>
                <p>
                  We use cookies and similar technologies to enhance user experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h3>
                <p>
                  Our website may contain links to third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h3>
                <p>
                  You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, please contact us at contact@retreats-holidays.com.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h3>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at contact@retreats-holidays.com.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <DetailedFooter />
    </div>
  );
};

export default Terms;
