'use client'

import { useState } from 'react'
import {
  Box,
  FileInput,
  Flex,
  useMantineTheme,
  Button,
  Group,
  Radio,
} from '@mantine/core'
import { PDFProvider, PDFViewer } from '../libs/PDF'
import { usePhrases } from './usePhrases'
import { PhraseHighlight } from './PhraseHighlight'
import { useWords } from './useWords'

type Mode = 'phrase' | 'word'

const ViewerWithUpload = () => {
  const [file, setFile] = useState<Uint8Array | null>(null)
  const [mode, setMode] = useState<Mode>('phrase')
  const [currentIndex, setCurrentIndex] = useState(0)

  const theme = useMantineTheme()

  const { phrases } = usePhrases()
  const { words } = useWords()

  const highlights = mode === 'phrase' ? phrases : words

  const handleFile = (file: File | null) => {
    if (!file) return

    setCurrentIndex(0)

    const reader = new FileReader()
    reader.onload = () => setFile(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file)
  }

  const isNextHighlightAvailable = currentIndex < highlights.length - 1
  const isPrevHighlightAvailable = currentIndex > 0
  const isModeCheckboxDisabled = !file

  const handleNextHighlight = () => {
    if (isNextHighlightAvailable) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevHighlight = () => {
    if (isPrevHighlightAvailable) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleModeChange = (value: string) => {
    setMode(value as Mode)
    setCurrentIndex(0)
  }

  return (
    <Flex mih='100vh' justify='center'>
      <Box flex='2 0 20%' bg={theme.colors.blue[1]} p='20px'>
        <FileInput
          label='Choose your PDF'
          onChange={handleFile}
          accept='application/pdf'
        />
        <Radio.Group
          value={mode}
          onChange={handleModeChange}
          name='mode'
          label='Select highlight mode'
        >
          <Group mt='xs' gap='10px'>
            <Radio
              value='phrase'
              label='Phrase'
              disabled={isModeCheckboxDisabled}
            />
            <Radio
              value='word'
              label='Word'
              disabled={isModeCheckboxDisabled}
            />
          </Group>
        </Radio.Group>
        <Group mt='md'>
          <Button
            disabled={!isPrevHighlightAvailable}
            onClick={handlePrevHighlight}
            color='gray'
          >
            Previous
          </Button>
          <Button
            disabled={!isNextHighlightAvailable}
            onClick={handleNextHighlight}
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
            {highlights.length > 0 && (
              <PhraseHighlight bbox={highlights[currentIndex].bbox} />
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
