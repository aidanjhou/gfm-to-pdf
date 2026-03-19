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
      if (!container) return

      // Clone the container to avoid modifying the original
      const clone = container.cloneNode(true) as HTMLElement
      clone.style.width = "210mm"
      
      // Remove scripts and styles that might cause issues
      const scripts = clone.querySelectorAll('script, style')
      scripts.forEach(el => el.remove())

      // Add print-specific styles with Chinese font
      clone.style.backgroundColor = "#ffffff"
      clone.style.color = "#000000"
      clone.style.padding = "20px"
      clone.style.fontFamily = "'Noto Sans SC', sans-serif"
      
      // Apply font family to all text elements
      const allElements = clone.querySelectorAll('*')
      allElements.forEach((el) => {
        const element = el as HTMLElement
        if (element.style.fontFamily === '' || !element.style.fontFamily) {
          element.style.fontFamily = "'Noto Sans SC', sans-serif"
        }
      })
      
      document.body.appendChild(clone)

      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      const fontkit = (await import("@pdf-lib/fontkit")).default

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: clone.scrollWidth
      })

      document.body.removeChild(clone)

      // Load Chinese font from Google Fonts
      const fontUrl = "https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYwNbPzS5HE.119.woff2"
      const fontResponse = await fetch(fontUrl)
      const fontBuffer = await fontResponse.arrayBuffer()

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      
      // Register and embed font using fontkit
      ;(pdf as any).registerFontkit?.(fontkit)
      ;(pdf as any).addFileToVFS("NotoSansSC-Regular.ttf", fontBuffer)
      ;(pdf as any).addFont("NotoSansSC-Regular.ttf", "NotoSansSC", "normal")
      ;(pdf as any).setFont("NotoSansSC")

      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const contentWidth = pageWidth - margin * 2
      const contentHeight = (canvas.height * contentWidth) / canvas.width
      
      let heightLeft = contentHeight
      let position = margin

      pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight)
      heightLeft -= (pageHeight - margin)

      while (heightLeft >= 0) {
        position = heightLeft - contentHeight + margin
        pdf.addPage()
        pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight)
        heightLeft -= (pageHeight - margin)
      }

      pdf.save("document.pdf")
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
