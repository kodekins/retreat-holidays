import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <title>Terms & Conditions | Retreats Holidays</title>
      <meta name="description" content="Read our terms of use and privacy policy for using Retreats Holidays services." />
      
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

        {/* Terms Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8 text-muted-foreground">
              
              {/* Section 1 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Who We Are and How to Contact Us</h2>
                <p>
                  The Platform is owned and operated by Quantum Solutions Trading DMCC, with a head office in Dubai and its registered office located at Jumeirah Lakes Towers, Cluster W, JBC5, Office 607. Registered DMCC Company: JLT2108 ("we", "our", "us", "Retreats Holidays"). To contact us, please email: info@retreats-holidays.com
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. About Us</h2>
                <p className="mb-4">
                  Retreats Holidays is a leading wellness and adventure platform, offering bespoke retreats and active experiences. We provide a space for verified Service Providers (the "Service Providers") to advertise their offerings to customers (the "Guests"). Our platform supports the listing and booking of:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wellness retreats (yoga retreats, wellness stays, spa escapes)</li>
                  <li>Sports and fitness services (e.g. kitesurfing, yoga instructors, fitness classes)</li>
                  <li>Outdoor and adventure experiences (e.g. hiking, nature immersion, sailing)</li>
                  <li>Culinary services (e.g. private chefs, catering, in-house meals)</li>
                  <li>Transport solutions (e.g. airport transfers, regional travel)</li>
                </ul>
                <p className="mt-4">
                  These services are collectively referred to as the "Services". All users of the platform, including Service Providers and Guests, are referred to as "users".
                </p>
                <p className="mt-4">
                  We also offer an AI-powered chatbot service to help users explore and connect with retreat experiences more efficiently. This chatbot acts as a connector, providing tailored suggestions and introducing Guests to relevant Service Providers. However, as with any online marketplace, it is the Guest's responsibility to follow up directly with the Service Provider to confirm service details, pricing, and booking conditions. Retreats Holidays acts solely as an intermediary and does not assume any liability for incomplete, inaccurate, or unverified information exchanged after the connection.
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Acceptance of Terms</h2>
                <p className="mb-4">
                  By using our Platform, you confirm that you accept these Terms of Use and agree to comply with them. If you do not agree, you must not use the Platform.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be 18 years of age or older to use our Platform.</li>
                  <li>Cardholders must retain transaction records and our policies.</li>
                  <li>Visa and MasterCard in AED, USD, and EUR are accepted.</li>
                  <li>Prices and currencies displayed at checkout will match the transaction receipt.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Other Terms That May Apply</h2>
                <p className="mb-4">These Terms refer to the following additional policies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cookie Policy</li>
                  <li>Privacy and Data Protection Policy (GDPR compliant)</li>
                  <li>Acceptable Use Policy</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Changes to Terms</h2>
                <p>We may revise these Terms at any time. Users are encouraged to review them regularly.</p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Changes to the Platform</h2>
                <p>We reserve the right to update, modify, or suspend the Platform at any time. We are not liable if the Platform is unavailable.</p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Account Security</h2>
                <p>User credentials must be kept confidential. If unauthorized access is suspected, notify us immediately.</p>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">8. Platform Usage & Booking</h2>
                <p>The Platform is for personal, non-commercial use only. Users may not modify or commercially exploit any part of the Platform without explicit permission. A stable internet connection is required.</p>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">9. User Conduct</h2>
                <p className="mb-4">Users agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post or transmit unlawful, offensive, or abusive content.</li>
                  <li>Interfere with the Platform's performance.</li>
                  <li>Send unsolicited or promotional material.</li>
                </ul>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">10. Third-Party Links</h2>
                <p>Links to third-party websites (e.g. partners or hotels) are for information only. We do not endorse or control their content.</p>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">11. Liability Disclaimer</h2>
                <p className="mb-4">We are not liable for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Platform interruptions or errors.</li>
                  <li>Indirect losses (e.g. profits, data, goodwill).</li>
                  <li>Bookings made through third-party Service Providers. We only limit liability where it is legally permissible to do so.</li>
                </ul>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">12. Data Use</h2>
                <p>We process data in line with our Privacy Policy.</p>
              </div>

              {/* Section 13 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">13. Viruses & Security</h2>
                <p>Users must not introduce harmful content. We report such violations to law enforcement.</p>
              </div>

              {/* Section 14 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">14. Force Majeure</h2>
                <p>We are not liable for delays due to events beyond our control (e.g. natural disasters, war, government actions).</p>
              </div>

              {/* Section 15 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">15. No Third-Party Beneficiaries</h2>
                <p>Unless explicitly stated, no third party has rights under these Terms.</p>
              </div>

              {/* Section 16 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">16. Governing Law</h2>
                <p>These Terms are governed by UAE law. Disputes will be resolved by UAE courts unless agreed otherwise.</p>
              </div>

              {/* Section 17 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">17. Fees</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service Providers: 5% booking fee deducted from payouts.</li>
                  <li>Guests: 3.5% booking fee added at checkout.</li>
                  <li>Damage fines: Not applicable (Service Providers must insure themselves).</li>
                </ul>
              </div>

              {/* Section 18 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">18. Service Providers</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Must have valid insurance.</li>
                  <li>Ensure clean and functioning spaces.</li>
                  <li>Submit relevant certifications where applicable.</li>
                </ul>
              </div>

              {/* Section 19 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">19. Guests</h2>
                <p className="mb-4">Guests agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respect booking terms and premises.</li>
                  <li>Follow all reasonable Service Provider instructions.</li>
                  <li>Cover costs for damage caused.</li>
                  <li>Ensure all travelers meet visa and entry requirements.</li>
                </ul>
              </div>

              {/* Section 20 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">20. Reviews</h2>
                <p className="mb-4">All reviews:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Are genuine and guest-approved.</li>
                  <li>Are not paid for or edited.</li>
                </ul>
              </div>

              {/* Section 21 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">21. Data Security</h2>
                <p>We do not store or share card details. We use secure systems for data protection.</p>
              </div>

              {/* Section 22 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">22. Refund Policy</h2>
                <p>Refunds are processed via the original payment method.</p>
              </div>

              {/* Section 23 */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">23. Cancellation Policy</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Service Providers choose their cancellation terms: Flexible, Semi-Flexible, Fixed, or Custom.</li>
                  <li>Retreats Holidays booking fee is non-refundable after 48 hours, but rescheduling may be allowed.</li>
                  <li>Pending (unconfirmed) bookings may be canceled without penalty.</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mb-2">Extenuating Circumstances</h3>
                <p>In rare cases, such as force majeure or last-minute provider cancellations, Guests may cancel their full retreat and receive refunds on all services, including accommodation and activities.</p>
              </div>

              {/* Contact */}
              <div className="pt-8 border-t border-border">
                <p className="text-foreground">
                  For complaints or urgent matters, contact us directly at{" "}
                  <a href="mailto:info@retreats-holidays.com" className="text-primary hover:underline">
                    info@retreats-holidays.com
                  </a>
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