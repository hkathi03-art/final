import '../styles/globals.css'
import Head from 'next/head'
import { AuthProvider } from '../lib/useAuth'
import { ThemeProvider } from '../lib/useTheme'
import { ToastProvider } from '../components/Toast'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Browser Embroidery Digitizer</title>
        <meta name="description" content="Production MVP for browser-based embroidery digitizing with stitch preview and export."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Component {...pageProps}/>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}
