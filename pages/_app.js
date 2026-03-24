import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../lib/useAuth'
import { ThemeProvider } from '../lib/useTheme'
import { ToastProvider } from '../components/Toast'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BSU International Student Portal</title>
        <meta name="description" content="Bowie State University International Student Portal — Housing, Mentorship, AI Guidance & Community"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      </Head>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Layout>
              <Component {...pageProps}/>
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}
