import { useEffect } from 'react'
import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import { usePDFContext } from '../context'

function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

let pdfjs: typeof import('pdfjs-dist') | null = null

export const useLoadDocument = ({
  file,
  onDocumentLoadSuccessRef,
  onDocumentLoadFailRef,
}: any) => {
  if (typeof window !== 'undefined') {
    import('pdfjs-dist').then((pdfjsObject) => {
      pdfjs = pdfjsObject

      pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs'
    })
  }

  const { setPdfDocument } = usePDFContext()

  useEffect(() => {
    const loadDocument = async () => {
      if (!pdfjs || !file) return

      const config: DocumentInitParameters = { data: file }

      try {
        const loadedPdfDocument = await pdfjs.getDocument(config).promise
        setPdfDocument(loadedPdfDocument)

        if (isFunction(onDocumentLoadSuccessRef.current)) {
          onDocumentLoadSuccessRef.current(loadedPdfDocument)
        }
      } catch {
        if (isFunction(onDocumentLoadFailRef.current)) {
          onDocumentLoadFailRef.current()
        }
      }
    }

    void loadDocument()
  }, [pdfjs, file])
}
