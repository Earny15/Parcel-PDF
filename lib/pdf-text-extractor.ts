export class PDFTextExtractor {
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('PDF Text Extractor - Starting text extraction from PDF:', file.name)
      
      // Dynamic import to avoid webpack bundling issues
      const pdfjsLib = await import('pdfjs-dist')
      
      // Try multiple worker sources for better compatibility
      if (typeof window !== 'undefined') {
        try {
          // First try the exact version match
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/pdf.worker.min.mjs`
        } catch (e) {
          console.warn('Failed to load worker v5.4.54, trying fallback...')
          // Fallback to a known stable version
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        }
      }
      
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      console.log('PDF Text Extractor - Loading PDF document...')
      const pdf = await pdfjsLib.getDocument({
        data: uint8Array,
        verbosity: 0, // Reduce console spam
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/standard_fonts/',
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.54/cmaps/',
        cMapPacked: true
      }).promise
      console.log(`PDF Text Extractor - PDF loaded successfully, ${pdf.numPages} pages found`)
      
      let fullText = ''
      
      // Extract text from all pages with better formatting
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`PDF Text Extractor - Processing page ${pageNum}/${pdf.numPages}`)
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        console.log(`PDF Text Extractor - Page ${pageNum} has ${textContent.items.length} text items`)
        
        // Process text items with better positioning
        const textItems = textContent.items
          .filter((item: any) => item.str && item.str.trim()) // Only non-empty text
          .map((item: any) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5]
          }))
          .sort((a, b) => b.y - a.y || a.x - b.x) // Sort by vertical position first, then horizontal
        
        const pageText = textItems.map(item => item.text).join(' ')
        
        fullText += pageText + '\\n\\n'
        console.log(`PDF Text Extractor - Page ${pageNum} text length:`, pageText.length)
        console.log(`PDF Text Extractor - Page ${pageNum} sample text:`, pageText.substring(0, 200))
      }
      
      console.log('PDF Text Extractor - Total extracted text length:', fullText.length)
      console.log('PDF Text Extractor - First 500 characters:', fullText.substring(0, 500))
      
      return fullText.trim()
    } catch (error) {
      console.error('PDF Text Extractor - Error extracting text from PDF:', error)
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
  }
}