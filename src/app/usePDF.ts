import { useState, useEffect, useRef } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'

function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

type PDFRenderTask = ReturnType<PDFPageProxy['render']>
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type UsePDFProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  file: ArrayBuffer | TypedArray | null
  page?: number
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void
  onDocumentLoadFail?: () => void
  onPageLoadSuccess?: (page: PDFPageProxy) => void
  onPageLoadFail?: () => void
  onPageRenderSuccess?: (page: PDFPageProxy) => void
  onPageRenderFail?: () => void
}

type ReturnValues = {
  pdfDocument: PDFDocumentProxy | undefined
  pdfPage: PDFPageProxy | undefined
}

export const usePDF = ({
  canvasRef,
  file,
  onDocumentLoadSuccess,
  onDocumentLoadFail,
  onPageLoadSuccess,
  onPageLoadFail,
  onPageRenderSuccess,
  onPageRenderFail,
  page = 1,
}: UsePDFProps): ReturnValues => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>()
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>()
  const renderTask = useRef<PDFRenderTask | null>(null)
  const lastPageRequestedRenderRef = useRef<PDFPageProxy | null>(null)
  const onDocumentLoadSuccessRef = useRef(onDocumentLoadSuccess)
  const onDocumentLoadFailRef = useRef(onDocumentLoadFail)
  const onPageLoadSuccessRef = useRef(onPageLoadSuccess)
  const onPageLoadFailRef = useRef(onPageLoadFail)
  const onPageRenderSuccessRef = useRef(onPageRenderSuccess)
  const onPageRenderFailRef = useRef(onPageRenderFail)

  // assign callbacks to refs to avoid redrawing
  useEffect(() => {
    onDocumentLoadSuccessRef.current = onDocumentLoadSuccess
  }, [onDocumentLoadSuccess])

  useEffect(() => {
    onDocumentLoadFailRef.current = onDocumentLoadFail
  }, [onDocumentLoadFail])

  useEffect(() => {
    onPageLoadSuccessRef.current = onPageLoadSuccess
  }, [onPageLoadSuccess])

  useEffect(() => {
    onPageLoadFailRef.current = onPageLoadFail
  }, [onPageLoadFail])

  useEffect(() => {
    onPageRenderSuccessRef.current = onPageRenderSuccess
  }, [onPageRenderSuccess])

  useEffect(() => {
    onPageRenderFailRef.current = onPageRenderFail
  }, [onPageRenderFail])

  useEffect(() => {
    if (!file) return

    const config: DocumentInitParameters = { data: file }

    getDocument(config).promise.then(
      (loadedPdfDocument) => {
        setPdfDocument(loadedPdfDocument)

        if (isFunction(onDocumentLoadSuccessRef.current)) {
          onDocumentLoadSuccessRef.current(loadedPdfDocument)
        }
      },
      () => {
        if (isFunction(onDocumentLoadFailRef.current)) {
          onDocumentLoadFailRef.current()
        }
      }
    )
  }, [file])

  useEffect(() => {
    // draw a page of the pdf
    const drawPDF = (page: PDFPageProxy) => {
      const viewport = page.getViewport({ scale: 1 })
      const canvasEl = canvasRef!.current
      if (!canvasEl) {
        return
      }

      const canvasContext = canvasEl.getContext('2d')
      if (!canvasContext) {
        return
      }

      canvasEl.height = viewport.height * window.devicePixelRatio
      canvasEl.width = viewport.width * window.devicePixelRatio

      canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio)

      // if previous render isn't done yet, we cancel it
      if (renderTask.current) {
        lastPageRequestedRenderRef.current = page
        renderTask.current.cancel()
        return
      }

      renderTask.current = page.render({
        canvasContext,
        viewport,
      })

      return renderTask.current.promise.then(
        () => {
          renderTask.current = null

          if (isFunction(onPageRenderSuccessRef.current)) {
            onPageRenderSuccessRef.current(page)
          }
        },
        (reason: Error) => {
          renderTask.current = null

          if (reason && reason.name === 'RenderingCancelledException') {
            const lastPageRequestedRender =
              lastPageRequestedRenderRef.current ?? page
            lastPageRequestedRenderRef.current = null
            drawPDF(lastPageRequestedRender)
          } else if (isFunction(onPageRenderFailRef.current)) {
            onPageRenderFailRef.current()
          }
        }
      )
    }

    if (pdfDocument) {
      pdfDocument.getPage(page).then(
        (loadedPdfPage) => {
          setPdfPage(loadedPdfPage)

          if (isFunction(onPageLoadSuccessRef.current)) {
            onPageLoadSuccessRef.current(loadedPdfPage)
          }

          drawPDF(loadedPdfPage)
        },
        () => {
          if (isFunction(onPageLoadFailRef.current)) {
            onPageLoadFailRef.current()
          }
        }
      )
    }
  }, [canvasRef, page, pdfDocument])

  return { pdfDocument, pdfPage }
}
