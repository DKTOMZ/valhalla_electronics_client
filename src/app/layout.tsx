'use client'
import {SessionProvider} from 'next-auth/react'
import './globals.css'
import {ABeeZee} from 'next/font/google'
import Script from 'next/script'
import {Session} from 'next-auth'
import React, {useEffect} from 'react'
import { SharedStateProvider } from './contexts/context'

const inter = ABeeZee({ subsets: ['latin'], weight: '400' })

export default function RootLayout(x: { children: React.ReactNode, session: Session }) {
    useEffect(()=>{
      if (typeof window !== 'undefined') {
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
          } else {
              document.documentElement.classList.remove('dark');
          }
      }
  },[]);

  return (
    <html lang="en">
      <Script src={'https://kit.fontawesome.com/086823c0ac.js'} crossOrigin='anonymous'></Script>
      <body className={`${inter.className} bg-gray-100 dark:bg-zinc-900`}>
        <div className='bg-gray-100 dark:bg-zinc-900 h-full'>
          <SharedStateProvider>
            <SessionProvider session={x.session}>
                {x.children}
            </SessionProvider>
          </SharedStateProvider>
        </div>
      </body>
    </html>
  )
}
