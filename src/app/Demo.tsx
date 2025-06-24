'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  FileInput,
  Flex,
  useMantineTheme,
  Button,
  Group,
} from '@mantine/core'
import * as pdfjsLib from 'pdfjs-lib'
import { type TextItem } from 'pdfjs-dist/types/src/display/api'
import { PDFProvider, PDFViewer, usePDFContext, type WordBox } from './libs/PDF'

const ViewerWithUpload = () => {
  const [file, setFile] = useState<Uint8Array | null>(null)
  const [words, setWords] = useState<WordBox[]>([])
  // const [sentences, setSentences] = useState<WordBox[][]>([])

  // const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  // const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { pdfPage } = usePDFContext()

  // console.log({ words, currentWordIndex, sentences, currentSentenceIndex })
  console.log({ words, currentIndex })

  // new content
  useEffect(() => {
    const processPdf = async () => {
      if (!pdfPage) return

      const viewport = pdfPage.getViewport({ scale: 1.5 })
      const textContent = await pdfPage.getTextContent()

      const wordBoxes: WordBox[] = []
      const scale = viewport.scale

      console.log({ scale })

      for (const item of textContent.items) {
        const textItem = item as TextItem

        // Only include items with at least one letter (a-z, A-Z)
        if (!textItem.str || !/[a-zA-Z]/.test(textItem.str)) {
          continue
        }

        // Transform item to viewport coordinates
        const transform = pdfjsLib.Util.transform(
          viewport.transform,
          textItem.transform
        ) as number[]

        // Calculate dimensions
        const x = transform[4]
        const y = transform[5]
        const width = textItem.width * scale
        const height = textItem.height * scale

        console.log({ str: textItem.str })

        wordBoxes.push({
          str: textItem.str,
          bbox: {
            left: x,
            top: y - 16, // Convert to top-based coordinate system
            width,
            height,
          },
        })
      }

      setWords(wordBoxes)

      // const viewport = pdfPage.getViewport({ scale: 1.5 })
      // const textContent = await pdfPage.getTextContent()

      // const wordBoxes: WordBox[] = textContent.items.map((item) => {
      //   const typedItem = item as TextItem
      //   console.log({ typedItem })

      //   const [a, b, c, d, e, f] = typedItem.transform
      //   const fontHeight = typedItem.height
      //   const x = e
      //   const y = f - fontHeight
      //   return {
      //     str: typedItem.str,
      //     bbox: {
      //       left: x * viewport.scale,
      //       top: (viewport.height - y - fontHeight) * viewport.scale,
      //       width: typedItem.width * viewport.scale,
      //       height: fontHeight * viewport.scale,
      //     },
      //   }
      // })

      // setWords(wordBoxes)

      // // Basic sentence grouping by punctuation
      // const sentenceEndRegex = /[.!?]/
      // const groupedSentences: WordBox[][] = []
      // let sentence: WordBox[] = []

      // for (let word of wordBoxes) {
      //   sentence.push(word)
      //   if (sentenceEndRegex.test(word.str.trim().slice(-1))) {
      //     groupedSentences.push([...sentence])
      //     sentence = []
      //   }
      // }
      // if (sentence.length > 0) groupedSentences.push(sentence)

      // setSentences(groupedSentences)
    }

    processPdf()
  }, [pdfPage])

  const theme = useMantineTheme()

  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFile(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(file)
  }

  // const nextWord = () => {
  //   const currentSentence = sentences[currentSentenceIndex]
  //   if (!currentSentence) return

  //   if (currentWordIndex < currentSentence.length - 1) {
  //     setCurrentWordIndex(currentWordIndex + 1)
  //   } else if (currentSentenceIndex < sentences.length - 1) {
  //     setCurrentSentenceIndex(currentSentenceIndex + 1)
  //     setCurrentWordIndex(0)
  //   }
  // }

  // const prevWord = () => {
  //   if (currentWordIndex > 0) {
  //     setCurrentWordIndex(currentWordIndex - 1)
  //   } else if (currentSentenceIndex > 0) {
  //     const prevSentence = sentences[currentSentenceIndex - 1]
  //     setCurrentSentenceIndex(currentSentenceIndex - 1)
  //     setCurrentWordIndex(prevSentence.length - 1)
  //   }
  // }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevWord = () => {
    if (currentIndex > 0) {
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
          <Button onClick={prevWord} color='gray'>
            Previous
          </Button>
          <Button onClick={nextWord} color='blue'>
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
            {/* {sentences.map((sentence, sIdx) =>
              sentence.map((word, wIdx) => {
                const isCurrentSentence = sIdx === currentSentenceIndex
                const isCurrentWord =
                  isCurrentSentence && wIdx === currentWordIndex

                return (
                  <div
                    key={`${sIdx}-${wIdx}`}
                    style={{
                      position: 'absolute',
                      borderRadius: 4,
                      backgroundColor: isCurrentWord
                        ? 'rgba(255, 165, 0, 0.6)'
                        : isCurrentSentence
                        ? 'rgba(255, 255, 0, 0.4)'
                        : 'transparent',
                      left: `${word.bbox.left}px`,
                      top: `${word.bbox.top}px`,
                      width: `${word.bbox.width}px`,
                      height: `${word.bbox.height}px`,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                )
              })
            )} */}
            {words.length > 0 && currentIndex < words.length && (
              <div
                style={{
                  position: 'absolute',
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 165, 0, 0.6)',
                  border: '2px solid orange',
                  left: `${words[currentIndex].bbox.left - 4}px`,
                  top: `${words[currentIndex].bbox.top - 2}px`,
                  width: `${words[currentIndex].bbox.width + 8}px`,
                  height: `${words[currentIndex].bbox.height + 4}px`,
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  zIndex: 10,
                }}
              />
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
