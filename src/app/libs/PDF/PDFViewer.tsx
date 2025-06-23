'use client'

import { useRef } from 'react'
import { usePDF, type UsePDFProps } from './usePDF'

type PDFViewerProps = {
  file: UsePDFProps['file']
}

export const PDFViewer = ({ file }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { pdfDocument, pdfPage } = usePDF({
    canvasRef,
    file,
  })

  console.log({ pdfDocument, pdfPage })

  const isDocumentLoading = file && !pdfDocument

  return (
    <div>
      {isDocumentLoading && <span>Loading...</span>}
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #ccc', display: 'block' }}
      />
    </div>
  )
}
