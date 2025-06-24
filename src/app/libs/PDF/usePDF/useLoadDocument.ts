import { useEffect, type RefObject } from 'react'
import { type DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import { type PDFDocumentProxy } from 'pdfjs-dist'
import { usePDFContext } from '../context'
import { type UsePDFProps } from './usePDF'

function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

let pdfjs: typeof import('pdfjs-dist') | null = null

type UseLoadDocumentProps = Pick<UsePDFProps, 'file'> & {
  onDocumentLoadSuccessRef: RefObject<
    ((document: PDFDocumentProxy) => void) | undefined
  >
  onDocumentLoadFailRef: RefObject<(() => void) | undefined>
}

export const useLoadDocument = ({
  file,
  onDocumentLoadSuccessRef,
  onDocumentLoadFailRef,
}: UseLoadDocumentProps) => {
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
