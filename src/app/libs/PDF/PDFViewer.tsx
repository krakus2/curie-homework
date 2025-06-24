'use client'

import { ReactNode, useRef } from 'react'
import { usePDF, type UsePDFProps } from './usePDF'
import { Box, Flex, Loader, Text } from '@mantine/core'
import { usePDFContext } from './context'

type PDFViewerProps = {
  file: UsePDFProps['file']
  placeholder?: string
  children: ReactNode
}

export const PDFViewer = ({ file, placeholder, children }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  usePDF({
    canvasRef,
    file,
  })

  const { pdfDocument } = usePDFContext()

  const isDocumentChosen = !!file
  const isDocumentLoading = file && !pdfDocument

  if (!isDocumentChosen)
    return placeholder ? (
      <Box p='20px'>
        <Text size='lg' fw='700' ta='center'>
          {placeholder}
        </Text>
      </Box>
    ) : null

  if (isDocumentLoading)
    return (
      <Flex p='20px' align='center' justify='center'>
        <Loader color='blue' size='xl' />
      </Flex>
    )

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {children}
    </div>
  )
}
