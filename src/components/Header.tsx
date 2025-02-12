'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className='bg-white shadow-sm'>
      <div className='container mx-auto px-4 py-4'>
        <nav className='flex justify-between items-center'>
          <Link href='/' className='flex items-center space-x-2'>
            <Image src='/logo.svg' alt='DocMosaic Logo' width={40} height={40} />
            <span className='text-2xl font-bold text-docmosaic-purple font-poppins'>DocMosaic</span>
          </Link>
          <div className='hidden md:flex items-center space-x-6'>
            {isLandingPage ? (
              <>
                <ul className='flex space-x-6 font-poppins'>
                  <li>
                    <Link
                      href='#features'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#how-it-works'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#use-cases'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      Use Cases
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='https://github.com/yourusername/docmosaic'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      GitHub
                    </Link>
                  </li>
                </ul>
                <Link href='/pdf-editor' className='btn-primary'>
                  Try DocMosaic
                </Link>
              </>
            ) : (
              <Link
                href='/'
                className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors font-poppins'
              >
                Back to Home
              </Link>
            )}
          </div>
          <button className='md:hidden text-docmosaic-purple' onClick={toggleMenu} aria-label='Toggle menu'>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
        {isMenuOpen && (
          <div className='absolute top-12 left-0 w-full bg-white md:hidden mt-4 px-4 py-4'>
            <ul className='flex flex-col space-y-4 font-poppins'>
              {isLandingPage ? (
                <>
                  <li>
                    <Link
                      href='#features'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#how-it-works'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='#use-cases'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      Use Cases
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='https://github.com/yourusername/docmosaic'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'
                    >
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link href='/pdf-editor' className='btn-primary inline-block text-center'>
                      Try DocMosaic
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link href='/' className='text-docmosaic-purple hover:text-docmosaic-terracotta transition-colors'>
                    Back to Home
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
