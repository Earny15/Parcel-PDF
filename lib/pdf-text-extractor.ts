export class PDFTextExtractor {
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('PDF Text Extractor - Starting text extraction from PDF:', file.name)
      
      // Dynamic import to avoid webpack bundling issues
      const pdfjsLib = await import('pdfjs-dist')
      
      // Configure PDF.js worker
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`
      }
      
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      console.log('PDF Text Extractor - Loading PDF document...')
      const pdf = await pdfjsLib.getDocument(uint8Array).promise
      console.log(`PDF Text Extractor - PDF loaded successfully, ${pdf.numPages} pages found`)
      
      let fullText = ''
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`PDF Text Extractor - Processing page ${pageNum}/${pdf.numPages}`)
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine all text items with spaces
        const pageText = textContent.items
          .filter((item: any) => item.str) // Only items with text
          .map((item: any) => item.str)
          .join(' ')
        
        fullText += pageText + '\\n\\n'
        console.log(`PDF Text Extractor - Page ${pageNum} text length:`, pageText.length)
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