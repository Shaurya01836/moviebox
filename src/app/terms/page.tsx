import { Metadata } from 'next';
import { siteConfig } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of service and user agreement for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Terms Of Service
        </h1>
        <p className="text-zinc-400 font-medium">
          Last updated: August 1, 2026
        </p>
      </div>

      <div className="space-y-10 text-zinc-300 leading-relaxed text-sm md:text-base">
        <p>
          Welcome to {siteConfig.name}. These Terms of Service (&quot;Terms&quot;) govern your use of the {siteConfig.name} platform. By accessing or using our services, you agree to be bound by these Terms.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">1. Nature of the Service</h2>
          <p>
            <strong className="text-white">{siteConfig.name} is an automated search engine and indexing tool.</strong> We provide a sleek, unified interface that aggregates metadata and links to media files available on the public internet.
          </p>
          <p>
            {siteConfig.name} does not host, upload, or control any of the video content, streams, or download files made available through the platform. All media is fetched directly from third-party servers. We do not verify the legality or licensing of the content hosted on these third-party servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">2. User Responsibility</h2>
          <p>
            By using {siteConfig.name}, you acknowledge that you are accessing third-party content at your own risk. You agree to use the service for personal, non-commercial entertainment purposes only. You are solely responsible for ensuring that your access to and consumption of third-party streams complies with the laws and regulations of your jurisdiction.
          </p>
          <p>
            {siteConfig.name} acts purely as a conduit and cannot be held liable for any copyright infringements, malware, or damages resulting from interactions with third-party hosting servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">3. Account Security</h2>
          <p>
            If you create an account to save preferences, watchlists, or sync history, you are responsible for safeguarding your login credentials. {siteConfig.name} reserves the right to suspend or terminate accounts that abuse the platform, attempt to reverse-engineer our APIs, or otherwise violate these Terms.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">4. Intellectual Property</h2>
          <p>
            The {siteConfig.name} interface, branding, code, and custom assets are the exclusive property of {siteConfig.name}. However, all movie posters, backdrops, character images, and metadata belong to their respective copyright holders (such as TMDB, AniList, or the studios).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">5. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time without prior notice. Continued use of the platform after changes have been made constitutes acceptance of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
}
