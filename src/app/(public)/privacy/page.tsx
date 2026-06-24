export const metadata = {
  title: 'Privacy Policy | MBG',
  description: 'Privacy Policy for Munna Bhai Gaming Tournaments',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl space-y-8">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-wider uppercase mb-4">
          PRIVACY <span className="text-primary">POLICY</span>
        </h1>
        <p className="text-muted-foreground uppercase tracking-widest font-bold text-sm">Last Updated: June 2026</p>
      </div>

      <div className="prose prose-invert prose-yellow max-w-none space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Munna Bhai Gaming (MBG), we are committed to protecting your privacy. When you register for our esports tournaments, we collect the following necessary information:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Personal Information:</strong> Your Full Name and Date of Birth.</li>
            <li><strong>Contact Details:</strong> Mobile Number (WhatsApp) and Discord Username to coordinate matches and distribute room credentials.</li>
            <li><strong>Game Data:</strong> Your Free Fire In-Game Name (IGN) and Free Fire UID for verification and leaderboard tracking.</li>
            <li><strong>Location Data:</strong> We briefly collect your geographic location (State) during registration to verify eligibility (e.g., Andhra Pradesh & Telangana residency). This is done securely via your browser's Geolocation API.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is strictly used for the administration of the tournament. Specifically, we use it to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Verify your identity and eligibility for regional tournaments.</li>
            <li>Communicate match schedules, room IDs, and passwords via WhatsApp or Discord.</li>
            <li>Maintain public leaderboards (Only your IGN and Team Name will be public).</li>
            <li>Prevent fraud, smurfing, or multiple registrations by the same user.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">3. Data Sharing and Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We <strong>do not</strong> sell, rent, or trade your personal information to third parties. Your Free Fire UID, Phone Number, and Date of Birth are securely stored in our backend (powered by Google Firebase) and are only accessible by authorized MBG Tournament Administrators. 
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Your data is retained only for the duration of the tournament season and for distributing prize pools.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2">4. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to request the deletion of your account and data at any time. However, requesting deletion during an active tournament will result in immediate disqualification for you and potentially your squad. To request data deletion, please contact our support team on Discord.
          </p>
        </section>
      </div>
    </div>
  );
}
