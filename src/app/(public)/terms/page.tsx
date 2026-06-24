export const metadata = {
  title: 'Terms of Service | MBG',
  description: 'Terms of Service for Munna Bhai Gaming Tournaments',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl space-y-8">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-wider uppercase mb-4">
          TERMS OF <span className="text-primary">SERVICE</span>
        </h1>
        <p className="text-muted-foreground uppercase tracking-widest font-bold text-sm">Last Updated: June 2026</p>
      </div>

      <div className="prose prose-invert prose-yellow max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By registering for or participating in any Munna Bhai Gaming (MBG) esports tournament, you agree to abide by these Terms of Service, as well as the official Tournament Rules. If you do not agree, you may not participate in our events.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">2. Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Players must meet the following criteria to participate:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Must be a resident of Andhra Pradesh (AP) or Telangana (TS). Our systems perform location verification. Registration from outside these regions may result in disqualification.</li>
            <li>Players must use their own, legitimate Free Fire accounts. Account sharing or smurfing is strictly prohibited.</li>
            <li>Players must maintain respectful conduct in the MBG Discord and WhatsApp channels.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">3. Competitive Integrity & Fair Play</h2>
          <p className="text-muted-foreground leading-relaxed">
            MBG maintains a zero-tolerance policy towards cheating, hacking, exploitation of bugs, or any form of unfair advantage. Any player found using third-party software to alter gameplay will be permanently banned from all future MBG events, and their current squad will be instantly disqualified without prize compensation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">4. Admin Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            The MBG Administration Team reserves the right to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Alter the tournament schedule, format, or prize pool distribution at any time due to unforeseen circumstances.</li>
            <li>Disqualify any team or player for violating rules or demonstrating toxic behavior.</li>
            <li>Make final and binding decisions on all disputes, match restarts, or rule interpretations.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">5. Prize Distribution</h2>
          <p className="text-muted-foreground leading-relaxed">
            Prize money will be distributed to the Team Captain within 14 business days following the conclusion of the Grand Finals. It is the sole responsibility of the Team Captain to distribute the prize pool among the squad members. MBG is not liable for internal squad disputes regarding prize money.
          </p>
        </section>
      </div>
    </div>
  );
}
