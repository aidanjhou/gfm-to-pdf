"use client"

import { useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function PrintPageContent() {
  const searchParams = useSearchParams()
  const content = useMemo(() => {
    const c = searchParams.get("content")
    return c ? decodeURIComponent(c) : ""
  }, [searchParams])

  useEffect(() => {
    // Trigger print dialog on load
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <html>
      <head>
        <title>Markdown Preview - Print</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Source+Code+Pro:wght@400;500&display=swap"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * { box-sizing: border-box; }
            body { 
              font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 20mm; 
              max-width: 210mm;
              margin: 0 auto;
              line-height: 1.6;
            }
            h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
            code { 
              background: #f6f8fa; 
              padding: 0.2em 0.4em; 
              border-radius: 3px;
              font-family: 'Source Code Pro', monospace;
            }
            pre { 
              background: #f6f8fa; 
              padding: 16px; 
              border-radius: 6px;
              overflow-x: auto;
            }
            pre code { 
              background: none; 
              padding: 0; 
            }
            table { 
              border-collapse: collapse; 
              width: 100%;
              margin: 1em 0;
            }
            th, td { 
              border: 1px solid #d0d7de; 
              padding: 8px 12px; 
            }
            th { background: #f6f8fa; }
            blockquote { 
              border-left: 4px solid #d0d7de; 
              margin: 1em 0; 
              padding-left: 1em;
              color: #656d76;
            }
            a { color: #0969da; }
            img { max-width: 100%; }
            @media print {
              body { padding: 0; }
            }
          `,
          }}
        />
      </head>
      <body dangerouslySetInnerHTML={{ __html: content }} />
    </html>
  )
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintPageContent />
    </Suspense>
  )
}
