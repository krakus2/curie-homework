import { useEffect, type RefObject } from 'react'
import { type RenderTask, type PDFPageProxy } from 'pdfjs-dist'
import { usePDFContext } from '../context'
import { type UsePDFProps } from './usePDF'

function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

type UseLoadPageProps = Pick<UsePDFProps, 'canvasRef'> & {
  page: number
  onPageRenderSuccessRef: RefObject<((page: PDFPageProxy) => void) | undefined>
  onPageRenderFailRef: RefObject<(() => void) | undefined>
  onPageLoadSuccessRef: RefObject<((page: PDFPageProxy) => void) | undefined>
  onPageLoadFailRef: RefObject<(() => void) | undefined>
  renderTask: RefObject<RenderTask | null>
  lastPageRequestedRenderRef: RefObject<PDFPageProxy | null>
}

export const useLoadPage = ({
  canvasRef,
  renderTask,
  page,
  lastPageRequestedRenderRef,
  onPageRenderSuccessRef,
  onPageRenderFailRef,
  onPageLoadSuccessRef,
  onPageLoadFailRef,
}: UseLoadPageProps) => {
  const { pdfDocument, setPdfPage } = usePDFContext()

  useEffect(() => {
    const drawPDF = async (page: PDFPageProxy) => {
      const viewport = page.getViewport({ scale: 1.5 })
      const canvasEl = canvasRef!.current
      if (!canvasEl) return

      const canvasContext = canvasEl.getContext('2d')
      if (!canvasContext) return

      canvasEl.height = viewport.height * window.devicePixelRatio
      canvasEl.width = viewport.width * window.devicePixelRatio
      canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio)

      if (renderTask.current) {
        lastPageRequestedRenderRef.current = page
        renderTask.current.cancel()
        return
      }

      try {
        renderTask.current = page.render({ canvasContext, viewport })
        await renderTask.current.promise
        renderTask.current = null

        if (isFunction(onPageRenderSuccessRef.current)) {
          onPageRenderSuccessRef.current(page)
        }
      } catch (reason: any) {
        renderTask.current = null

        if (reason?.name === 'RenderingCancelledException') {
          const lastPageRequestedRender =
            lastPageRequestedRenderRef.current ?? page
          lastPageRequestedRenderRef.current = null
          await drawPDF(lastPageRequestedRender)
        } else if (isFunction(onPageRenderFailRef.current)) {
          onPageRenderFailRef.current()
        }
      }
    }

    const loadPage = async () => {
      if (!pdfDocument) return

      try {
        const loadedPdfPage = await pdfDocument.getPage(page)
        setPdfPage(loadedPdfPage)

        if (isFunction(onPageLoadSuccessRef.current)) {
          onPageLoadSuccessRef.current(loadedPdfPage)
        }

        await drawPDF(loadedPdfPage)
      } catch {
        if (isFunction(onPageLoadFailRef.current)) {
          onPageLoadFailRef.current()
        }
      }
    }

    void loadPage()
  }, [canvasRef, page, pdfDocument])
}
