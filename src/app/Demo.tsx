'use client'

import { useState } from 'react'
import { PDFViewer } from './libs/PDF'

export const Demo = () => {
  const [file, setFile] = useState<Uint8Array | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFile(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file)
  }

  return (
    <div>
      <input type='file' onChange={handleFile} accept='application/pdf' />
      <PDFViewer file={file} />
    </div>
  )
}
