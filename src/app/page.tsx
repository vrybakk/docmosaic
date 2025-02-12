import { ArrowRight, Github, Layout, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <main>
        <section className='container mx-auto px-4 py-20'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <h1 className='text-5xl lg:text-7xl font-bold leading-tight text-[#381D2A]'>
                Unleash Your <br />
                Creativity with <br />
                <span className='text-[#BA5624]'>Document Design</span>
              </h1>
              <p className='text-xl max-w-lg'>
                Elevate your document organization with our intuitive mosaic-style layout system, designed to inspire,
                organize, and empower your creative process.
              </p>
              <div className='grid grid-cols-3 gap-8'>
                <div>
                  <div className='stats-value'>50+</div>
                  <div className='stats-label'>Active Users</div>
                </div>
                <div>
                  <div className='stats-value'>10+</div>
                  <div className='stats-label'>Templates</div>
                </div>
                <div>
                  <div className='stats-value'>5+</div>
                  <div className='stats-label'>Layout Options</div>
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link href='/pdf-editor' className='btn-primary inline-flex items-center justify-center font-poppins'>
                  Try DocMosaic Now
                  <ArrowRight className='ml-2 w-5 h-5' />
                </Link>
                <Link href='#features' className='btn-secondary inline-flex items-center justify-center font-poppins'>
                  Learn More
                </Link>
              </div>
            </div>
            <div className='flex justify-center lg:justify-end'>
              <Image src='/logo.svg' alt='DocMosaic Logo' width={400} height={400} className='w-full max-w-lg' />
            </div>
          </div>
        </section>

        <section id='features' className='py-20 bg-docmosaic-cream'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center text-docmosaic-purple mb-12 font-poppins'>Why DocMosaic?</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg'
                >
                  <div className='w-12 h-12 mb-4 bg-docmosaic-terracotta rounded-lg flex items-center justify-center'>
                    <feature.icon className='w-6 h-6 text-white' />
                  </div>
                  <h3 className='text-xl font-semibold text-docmosaic-purple mb-2 font-poppins'>{feature.title}</h3>
                  <p className='text-gray-600'>{feature.description}</p>
                </div>
              ))}
            </div>
            <div className='mt-12 text-center'>
              <Link href='/pdf-editor' className='btn-primary inline-flex items-center justify-center font-poppins'>
                Start Creating Now
                <ArrowRight className='ml-2 w-5 h-5' />
              </Link>
            </div>
          </div>
        </section>

        <section id='how-it-works' className='py-20 bg-white'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center text-docmosaic-purple mb-12 font-poppins'>How It Works</h2>
            <div className='flex flex-wrap justify-center'>
              {steps.map((step, index) => (
                <div key={index} className='w-full sm:w-1/2 md:w-1/3 lg:w-1/5 px-4 mb-8'>
                  <div className='bg-docmosaic-cream rounded-lg p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:shadow-md'>
                    <div className='w-12 h-12 bg-docmosaic-terracotta rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 font-poppins'>
                      {index + 1}
                    </div>
                    <h3 className='text-lg font-semibold text-docmosaic-purple mb-2 font-poppins'>{step.title}</h3>
                    <p className='text-gray-600 flex-grow'>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id='use-cases' className='py-20 bg-docmosaic-sage'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center text-docmosaic-purple mb-12 font-poppins'>Perfect For</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg'
                >
                  <div className='text-4xl mb-4'>{useCase.emoji}</div>
                  <h3 className='text-xl font-semibold text-docmosaic-purple mb-2 font-poppins'>{useCase.title}</h3>
                  <p className='text-gray-600'>{useCase.description}</p>
                </div>
              ))}
            </div>
            <div className='mt-12 text-center'>
              <Link href='/pdf-editor' className='btn-primary inline-flex items-center justify-center font-poppins'>
                Try DocMosaic Free
                <ArrowRight className='ml-2 w-5 h-5' />
              </Link>
            </div>
          </div>
        </section>

        <section className='py-20 bg-docmosaic-purple text-white'>
          <div className='container mx-auto px-4 text-center'>
            <h2 className='text-3xl font-bold mb-6 font-poppins'>Join Our Open Source Community</h2>
            <p className='text-xl mb-8 max-w-2xl mx-auto'>
              DocMosaic is developed openly. Find us on GitHub to explore the code, contribute to development, share
              ideas, and report issues.
            </p>
            <Link
              href='https://github.com/yourusername/docmosaic'
              target='_blank'
              rel='noopener noreferrer'
              className='btn-secondary inline-flex items-center font-poppins'
            >
              <Github className='mr-2 w-5 h-5' />
              View on GitHub
            </Link>
          </div>
        </section>
      </main>

      <footer className='bg-gray-100 text-docmosaic-purple py-12'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <h3 className='text-lg font-semibold mb-4 font-poppins'>DocMosaic</h3>
              <p className='text-gray-600'>
                Free and open source tool for creating structured PDF documents with arranged images.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-4 font-poppins'>Links</h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='https://github.com/yourusername/docmosaic'
                    className='text-gray-600 hover:text-docmosaic-terracotta transition-colors'
                  >
                    GitHub Repository
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-600 hover:text-docmosaic-terracotta transition-colors'>
                    Issue Tracker
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-4 font-poppins'>Built With</h3>
              <ul className='space-y-2'>
                <li className='text-gray-600'>Next.js</li>
                <li className='text-gray-600'>TypeScript</li>
                <li className='text-gray-600'>Tailwind CSS</li>
                <li className='text-gray-600'>React PDF</li>
              </ul>
            </div>
          </div>
          <div className='mt-8 pt-8 border-t border-gray-200 text-center text-gray-600'>
            <p>&copy; {new Date().getFullYear()} DocMosaic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Visual Document Building',
    description: 'Arrange elements efficiently with intuitive controls.',
    icon: Layout,
  },
  {
    title: 'Instant Results',
    description: 'See your document take shape in real-time as you work.',
    icon: Zap,
  },
  {
    title: 'Free & Open Source',
    description: 'No hidden costs. Use and contribute freely.',
    icon: Github,
  },
  {
    title: 'Browser-Only',
    description: 'Your files never leave your device, ensuring privacy.',
    icon: Shield,
  },
];

const steps = [
  { title: 'Start Your Document', description: 'Choose your page size and orientation.' },
  { title: 'Create Your Layout', description: 'Design your document structure with our intuitive grid system.' },
  { title: 'Add Your Images', description: 'Upload and place your images onto the layout.' },
  { title: 'Arrange to Perfection', description: 'Fine-tune positioning and sizing for the perfect look.' },
  { title: 'Download PDF', description: 'Generate and download your finished document instantly.' },
];

const useCases = [
  {
    emoji: '🪪',
    title: 'Identity Documents',
    description: 'Combine both sides of your ID on one page with precise alignment.',
  },
  { emoji: '📸', title: 'Photo Collections', description: 'Organize multiple photos in a structured layout.' },
  {
    emoji: '🧾',
    title: 'Business Documents',
    description: 'Compile receipts, business cards, or documents efficiently.',
  },
  {
    emoji: '📑',
    title: 'Visual Documentation',
    description: 'Create visual documentation with accurate image placement.',
  },
];
