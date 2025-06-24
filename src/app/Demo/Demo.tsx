'use client'

import { useState } from 'react'
import {
  Box,
  FileInput,
  Flex,
  useMantineTheme,
  Button,
  Group,
} from '@mantine/core'
import { PDFProvider, PDFViewer } from '../libs/PDF'
import { usePhrases } from './usePhrases'
import { PhraseHighlight } from './PhraseHighlight'

const ViewerWithUpload = () => {
  const [file, setFile] = useState<Uint8Array | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const theme = useMantineTheme()

  const { phrases } = usePhrases()

  const handleFile = (file: File | null) => {
    if (!file) return

    setCurrentIndex(0)

    const reader = new FileReader()
    reader.onload = () => setFile(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file)
  }

  const isNextPhraseAvailable = currentIndex < phrases.length - 1
  const isPrevPhraseAvailable = currentIndex > 0

  const handleNextPhrase = () => {
    if (isNextPhraseAvailable) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevPhrase = () => {
    if (isPrevPhraseAvailable) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <Flex mih='100vh' justify='center'>
      <Box flex='2 0 20%' bg={theme.colors.blue[1]} p='20px'>
        <FileInput
          label='Choose your PDF'
          onChange={handleFile}
          accept='application/pdf'
        />
        <Group mt='md'>
          <Button
            disabled={!isPrevPhraseAvailable}
            onClick={handlePrevPhrase}
            color='gray'
          >
            Previous
          </Button>
          <Button
            disabled={!isNextPhraseAvailable}
            onClick={handleNextPhrase}
            color='blue'
          >
            Next
          </Button>
        </Group>
      </Box>
      <Flex flex='8 0 80%' justify='center'>
        <PDFViewer
          file={file}
          placeholder='Reader placeholder. Choose you PDF file'
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {phrases.length > 0 && currentIndex < phrases.length && (
              <PhraseHighlight bbox={phrases[currentIndex].bbox} />
            )}
          </div>
        </PDFViewer>
      </Flex>
    </Flex>
  )
}

export const Demo = () => (
  <PDFProvider>
    <ViewerWithUpload />
  </PDFProvider>
)
