"use client"

import { useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import { FileDown } from "lucide-react"

const DEFAULT_MD = `# Welcome to GFM to PDF

## Features

- **GitHub Flavored Markdown** support
- Real-time preview
- Export to PDF

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| GFM | ✅ |
| PDF Export | ✅ |
| SSR | ✅ |

### Task List

- [x] Create project
- [ ] Add PDF export
- [ ] Deploy

> This is a blockquote
`

export default function Home() {
  const [content, setContent] = useState(DEFAULT_MD)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true)
    try {
      const container = document.getElementById("preview-container")
      if (!container) return

      // Dynamic import to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default

      const opt = {
        margin: 10,
        filename: "document.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      }

      await html2pdf().set(opt).from(container).save()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">GFM to PDF</h1>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isExporting ? (
              <span>Exporting...</span>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex">
        <div className="w-1/2 border-r flex flex-col">
          <div className="p-2 border-b bg-muted/50 text-sm font-medium">Markdown</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
            placeholder="Enter markdown here..."
          />
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="p-2 border-b bg-muted/50 text-sm font-medium">Preview</div>
          <div 
            id="preview-container"
            className="flex-1 p-6 overflow-auto"
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
