import { FirebaseProvider } from '@/context/FirebaseContext'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Aura Keeper',
  description: 'Track and manage your aura',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
      <FirebaseProvider>
        {children}
      </FirebaseProvider>
      </body>
    </html>
  )
}
