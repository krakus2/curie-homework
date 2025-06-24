import { createContext, useContext, useState } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export type PDFContextType = {
  pdfDocument: PDFDocumentProxy | undefined
  setPdfDocument: (doc: PDFDocumentProxy | undefined) => void
  pdfPage: PDFPageProxy | undefined
  setPdfPage: (page: PDFPageProxy | undefined) => void
}

const PDFContext = createContext<PDFContextType | null>(null)

export const usePDFContext = () => {
  const ctx = useContext(PDFContext)
  if (!ctx) throw new Error('usePDFContext must be used within a PDFProvider')
  return ctx
}

export const PDFProvider = ({ children }: { children: React.ReactNode }) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>()
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>()

  return (
    <PDFContext.Provider
      value={{
        pdfDocument,
        setPdfDocument,
        pdfPage,
        setPdfPage,
      }}
    >
      {children}
    </PDFContext.Provider>
  )
}
