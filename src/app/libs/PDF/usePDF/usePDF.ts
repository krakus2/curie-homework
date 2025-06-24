import { useRef } from 'react'
import { type PDFDocumentProxy, type PDFPageProxy } from 'pdfjs-dist'
import { usePDFContext } from '../context'
import { useLoadDocument } from './useLoadDocument'
import { useLoadPage } from './useLoadPage'
import { useStableCallbacks } from './useStableCallbacks'

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

export type BBox = {
  left: number
  top: number
  width: number
  height: number
}

export type WordBox = {
  str: string
  bbox: BBox
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
}: UsePDFProps) => {
  const { setPdfDocument } = usePDFContext()

  const renderTask = useRef<PDFRenderTask | null>(null)
  const lastPageRequestedRenderRef = useRef<PDFPageProxy | null>(null)

  const {
    onDocumentLoadSuccess: onDocumentLoadSuccessRef,
    onDocumentLoadFail: onDocumentLoadFailRef,
    onPageLoadSuccess: onPageLoadSuccessRef,
    onPageLoadFail: onPageLoadFailRef,
    onPageRenderSuccess: onPageRenderSuccessRef,
    onPageRenderFail: onPageRenderFailRef,
  } = useStableCallbacks({
    onDocumentLoadSuccess,
    onDocumentLoadFail,
    onPageLoadSuccess,
    onPageLoadFail,
    onPageRenderSuccess,
    onPageRenderFail,
  })

  useLoadDocument({
    file,
    setPdfDocument,
    onDocumentLoadSuccessRef,
    onDocumentLoadFailRef,
  })

  useLoadPage({
    renderTask,
    page,
    canvasRef,
    lastPageRequestedRenderRef,
    onPageRenderSuccessRef,
    onPageRenderFailRef,
    onPageLoadSuccessRef,
    onPageLoadFailRef,
  })
}
