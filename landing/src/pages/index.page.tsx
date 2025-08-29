import type { ReactElement } from 'react';
import HeroImage from '../components/svg/HeroImage';
import CustomReportsIcon from '../components/svg/CustomReportsIcon';
import RealTimeInsightsIcon from '../components/svg/RealTimeInsightsIcon';
import IntegrationsIcon from '../components/svg/IntegrationsIcon';
import ReportsIcon from '../components/svg/ReportsIcon';
import AutomationIcon from '../components/svg/AutomationIcon';
import DashboardIcon from '../components/svg/DashboardIcon';

export const title = 'Invoice Analytics';
export const description = 'Gain Deep Insights into Your Invoices';

type Feature = {
  readonly title: string;
  readonly description: string;
  readonly icon: ReactElement;
};

const features: readonly Feature[] = [
  {
    title: 'Custom Reports',
    description: 'Generate tailored invoice analytics to match your KPIs',
    icon: <CustomReportsIcon />,
  },
  {
    title: 'Real-Time Insights',
    description: 'Instant visibility into outstanding payments and cash flow',
    icon: <RealTimeInsightsIcon />,
  },
  {
    title: 'Seamless Integrations',
    description: 'Connect with QuickBooks, Xero, and other accounting tools',
    icon: <IntegrationsIcon />,
  },
];

type ProductHighlight = {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly icon: ReactElement;
};

const productHighlights: readonly ProductHighlight[] = [
  {
    title: 'Generate Custom Invoice Reports in Seconds',
    description: 'Quickly create detailed analytics reports with customizable metrics.',
    tags: ['Real-time data', 'Customizable metrics', 'Exportable'],
    icon: <ReportsIcon />,
  },
  {
    title: 'Automate Your Billing Workflow',
    description: 'Streamline invoice processing and payment reminders.',
    tags: ['Automated notifications', 'Smart filters', 'Schedule'],
    icon: <AutomationIcon />,
  },
  {
    title: 'Monitor Cash Flow & Performance',
    description: 'Visualize key financial metrics and forecasts.',
    tags: ['Dashboards', 'Trend analysis', 'Predictive analytics'],
    icon: <DashboardIcon />,
  },
];

type Testimonial = {
  readonly quote: string;
  readonly author: string;
  readonly company: string;
};

const testimonials: readonly Testimonial[] = [
  {
    quote: 'Our receivables days dropped by 20% thanks to Invoice Analytics.',
    author: 'Sarah Johnson',
    company: 'CFO, TechCorp',
  },
  {
    quote: 'Automated workflows saved us hours every week.',
    author: 'Michael Chen',
    company: 'Financial Director, GrowthLabs',
  },
  {
    quote: 'Real-time dashboards make our reporting a breeze.',
    author: 'Jessica Williams',
    company: 'Accounting Manager, SmartRetail',
  },
];

type FAQ = {
  readonly question: string;
  readonly answer: string;
};

const faqs: readonly FAQ[] = [
  {
    question: 'What is Invoice Analytics?',
    answer:
      'Invoice Analytics is a powerful platform that helps finance teams track, analyze, and optimize their billing processes. It provides real-time insights into outstanding payments, cash flow, and financial performance.',
  },
  {
    question: 'What integrations do you support?',
    answer:
      'We integrate seamlessly with popular accounting software including QuickBooks, Xero, FreshBooks, Sage, and Zoho. We also offer an API for custom integrations with your existing systems.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We take security seriously. All data is encrypted in transit and at rest, and we use industry-standard security practices to protect your information. We also comply with GDPR, CCPA, and other relevant regulations.',
  },
];

type Stat = {
  readonly value: string;
  readonly label: string;
};

const stats: readonly Stat[] = [
  { value: '24/7', label: 'Support' },
  { value: '500+', label: 'Companies' },
  { value: '100k+', label: 'Invoices Processed' },
  { value: '99.9%', label: 'Uptime' },
];

type LandingPageProps = {
  appUrl?: string;
};

export default function LandingPage({ appUrl = '/app' }: LandingPageProps): ReactElement {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/icon.svg" alt="Invoice Analytics" className="h-8" />
          <h1 className="text-2xl font-bold text-white">Invoice Analytics</h1>
          <nav className="hidden md:flex ml-12">
            <a href="#dashboard" className="text-slate-300 hover:text-teal-400 px-4">
              Dashboard
            </a>
            <a href="#reports" className="text-slate-300 hover:text-teal-400 px-4">
              Reports
            </a>
            <a href="#integrations" className="text-slate-300 hover:text-teal-400 px-4">
              Integrations
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-teal-400 px-4">
              Pricing
            </a>
            <a href="#blog" className="text-slate-300 hover:text-teal-400 px-4">
              Blog
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#learn" className="text-slate-300 hover:text-teal-400">
            Get Started
          </a>
          <a
            href={appUrl}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black font-medium px-4 py-2 rounded-md transition-colors">
            Login
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 bg-[radial-gradient(circle_500px_at_50%_20%,#134E4A,transparent)]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
              <span className="inline-block bg-slate-800 text-teal-400 px-3 py-1 text-xs font-semibold rounded-full mb-6">
                NEW - We just launched our Invoice Analytics Platform
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unlock Powerful Insights into Your Billing with Invoice Analytics
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Analytics designed for finance teams and CFOs
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={appUrl}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black font-bold px-6 py-3 rounded-md transition-colors">
                  Login
                </a>
                <a
                  href="#learn"
                  className="bg-transparent border border-teal-500 text-teal-400 hover:text-teal-300 hover:border-teal-400 font-bold px-6 py-3 rounded-md transition-colors">
                  Learn More
                </a>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <HeroImage />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-slate-300 mb-8">
            Over 4,000 finance professionals trust Invoice Analytics to optimize their billing
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <span className="text-slate-400 font-medium">QuickBooks</span>
            <span className="text-slate-400 font-medium">Xero</span>
            <span className="text-slate-400 font-medium">FreshBooks</span>
            <span className="text-slate-400 font-medium">Sage</span>
            <span className="text-slate-400 font-medium">Zoho</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Optimize Your Billing Process</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-8 hover:bg-slate-800/70 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
          {productHighlights.map((highlight, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 mb-24 last:mb-0`}>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">{highlight.title}</h3>
                <p className="text-slate-300 mb-6">{highlight.description}</p>
                <div className="flex flex-wrap gap-2">
                  {highlight.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-slate-800 text-teal-400 px-3 py-1 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2">{highlight.icon}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials & Stats */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">What Finance Teams Are Saying</h2>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800 p-8 rounded-lg">
                <blockquote className="text-lg mb-6">"{testimonial.quote}"</blockquote>
                <footer>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-teal-400 text-sm">{testimonial.company}</div>
                </footer>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-teal-400 mb-2">{stat.value}</div>
                <div className="text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                <p className="text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-gradient-to-r from-teal-500/20 to-emerald-600/20 p-12 rounded-xl border border-teal-500/30 text-center">
            <h2 className="text-3xl font-bold mb-8">
              Get Instant Invoice Insights with Invoice Analytics
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={appUrl}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black font-bold px-6 py-3 rounded-md transition-colors">
                Get Started
              </a>
              <a
                href="#learn"
                className="bg-transparent border border-teal-500 text-teal-400 hover:text-teal-300 hover:border-teal-400 font-bold px-6 py-3 rounded-md transition-colors">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-6">Managing invoices has never been easier.</h2>
          <p className="text-slate-300 mb-6">
            As finance professionals ourselves, we understand the challenges you face with invoice
            management. Our platform is designed to bring clarity to your billing process, saving
            you time and helping you make better financial decisions.
          </p>
          <div className="font-medium">Edward D.</div>
          <div className="text-teal-400 text-sm">CEO of Invoice Analytics</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between mb-10">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Invoice Analytics</h3>
              <p className="text-slate-400 max-w-xs">
                Helping finance teams optimize their billing process with powerful analytics.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              <div>
                <h4 className="font-bold mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#dashboard" className="text-slate-400 hover:text-teal-400">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#reports" className="text-slate-400 hover:text-teal-400">
                      Reports
                    </a>
                  </li>
                  <li>
                    <a href="#integrations" className="text-slate-400 hover:text-teal-400">
                      Integrations
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#support" className="text-slate-400 hover:text-teal-400">
                      Support
                    </a>
                  </li>
                  <li>
                    <a href="#terms" className="text-slate-400 hover:text-teal-400">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-slate-400 hover:text-teal-400">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Connect</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#email" className="text-slate-400 hover:text-teal-400">
                      Email
                    </a>
                  </li>
                  <li>
                    <a href="#linkedin" className="text-slate-400 hover:text-teal-400">
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="#twitter" className="text-slate-400 hover:text-teal-400">
                      Twitter
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500">
            {new Date().getFullYear()} © All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
