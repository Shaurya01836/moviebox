import { Metadata } from 'next';
import { siteConfig } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy and data handling practices for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-zinc-400 font-medium">
          Last updated: August 1, 2026
        </p>
      </div>

      <div className="space-y-10 text-zinc-300 leading-relaxed text-sm md:text-base">
        <p>
          At {siteConfig.name}, your privacy and digital security are highly prioritized. This Privacy Policy outlines how we handle data when you use our web application. By using {siteConfig.name}, you consent to the practices described below.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">1. Information We Collect</h2>
          <p>
            {siteConfig.name} is designed to be as minimally invasive as possible. We only collect the information necessary to provide account features:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong className="text-white">Account Data:</strong> If you choose to register, we store your email address, username, and encrypted password. For OAuth logins, we store basic profile information provided by the authentication provider.
            </li>
            <li>
              <strong className="text-white">Usage Data:</strong> We may locally store preferences (such as watchlist items or watch history) to enhance your experience.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">2. Third-Party Content & IP Addresses</h2>
          <p>
            <strong className="text-white">Crucial Notice:</strong> {siteConfig.name} does NOT host any media. All video streams, images, and download links are fetched directly from external, third-party servers.
          </p>
          <p>
            Because your browser connects directly to these third-party servers to stream video or download files, those external servers will be able to see your IP address. We do not control these third-party servers, and their data collection practices are governed by their respective privacy policies. If you wish to protect your IP address from third-party hosts, we strongly recommend using a reputable VPN service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">3. Data Sharing & Security</h2>
          <p>
            We will never sell, rent, or trade your personal account information to marketers or unauthorized third parties. We employ industry-standard encryption to protect your account credentials. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>
      </div>
    </div>
  );
}
