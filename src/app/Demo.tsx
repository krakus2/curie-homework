'use client'

import { useState } from 'react'
import { FileInput } from '@mantine/core'
import { Stack } from '@mantine/core'
import { PDFViewer } from './libs/PDF'

export const Demo = () => {
  const [file, setFile] = useState<Uint8Array | null>(null)

  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFile(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file)
  }

  return (
    <Stack align='center'>
      <FileInput
        label='Choose your PDF'
        onChange={handleFile}
        accept='application/pdf'
      />
      <PDFViewer file={file} />
    </Stack>
  )
}
