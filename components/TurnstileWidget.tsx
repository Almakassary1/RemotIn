'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export default function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    // Guard renderedRef mencegah widget ter-render dobel akibat React
    // StrictMode (dev mode) yang memanggil effect dua kali.
    if (!scriptReady || !containerRef.current || !window.turnstile || renderedRef.current) return
    renderedRef.current = true

    window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: onVerify,
      'expired-callback': () => onExpire?.(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  )
}
