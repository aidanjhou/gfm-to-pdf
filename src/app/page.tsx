"use client"

import { useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import { FileDown } from "lucide-react"

const DEFAULT_MD = `# 欢迎使用 GFM 转 PDF

## 功能特点

- **GitHub 风格 Markdown** 渲染
- 实时预览
- 导出 PDF

### 代码示例

\`\`\`javascript
function hello() {
  console.log("你好，世界！");
}
\`\`\`

### 表格

| 功能 | 状态 |
|------|------|
| GFM 支持 | ✅ |
| PDF 导出 | ✅ |
| SSR | ✅ |

### 任务列表

- [x] 创建项目
- [ ] 添加更多功能
- [ ] 部署上线

> 这是一段引用文本

测试中文标点：顿号、逗号、句号、分号、冒号、引号「」『』

自动链接：https://example.com
`

export default function Home() {
  const [content, setContent] = useState(DEFAULT_MD)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true)
    try {
      const container = document.getElementById("preview-container")
      if (!container) {
        console.error("Preview container not found")
        return
      }

      // Clone and prepare content for PDF
      const clone = container.cloneNode(true) as HTMLElement
      clone.style.position = "fixed"
      clone.style.left = "0"
      clone.style.top = "0"
      clone.style.width = "210mm"
      clone.style.zIndex = "-1"
      clone.style.backgroundColor = "#ffffff"
      clone.style.color = "#000000"
      clone.style.padding = "20mm"
      clone.style.fontFamily = "'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif"
      
      // Add style to remove blockquote pseudo-elements (Tailwind adds quotes)
      const style = document.createElement("style")
      style.textContent = `
        blockquote::before, blockquote::after { content: none !important; }
        blockquote { border-left: 4px solid #d0d7de !important; }
      `
      clone.appendChild(style)
      
      document.body.appendChild(clone)

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100))

      // Import html2pdf.js
      const html2pdf = (await import("html2pdf.js")).default
      
      // Generate and download PDF
      const opt = {
        margin: 10,
        filename: "document.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
      }

      await html2pdf().set(opt).from(clone).save()
      
      document.body.removeChild(clone)
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
