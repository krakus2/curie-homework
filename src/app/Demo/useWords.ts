'use client'

import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-lib'
import { type TextItem } from 'pdfjs-dist/types/src/display/api'
import { usePDFContext, type WordBox } from '../libs/PDF'

type TextItemWithCharsCoordinates = TextItem & {
  chars: Array<{
    char: string
    unicode: string
    transform: number[]
    width: number
  }>
}

export const useWords = () => {
  const [words, setWords] = useState<WordBox[]>([])
  const { pdfPage } = usePDFContext()

  useEffect(() => {
    const processPdf = async () => {
      if (!pdfPage) return

      const viewport = pdfPage.getViewport({ scale: 1.5 })
      const textContent = await pdfPage.getTextContent()

      const wordBoxes: WordBox[] = []

      for (const item of textContent.items) {
        const textItem = item as TextItemWithCharsCoordinates

        if (!textItem.str || !textItem.chars || textItem.chars.length === 0) {
          continue
        }

        // Split full string into words
        const wordsInString = textItem.str.split(/\s+/)

        let charIndex = 0

        for (const word of wordsInString) {
          if (!word) continue

          const startCharIndex = charIndex
          let charsUsed = 0

          // Try to match characters in `chars` with current word length
          while (charIndex < textItem.chars.length && charsUsed < word.length) {
            charsUsed += textItem.chars[charIndex].unicode.length
            charIndex++
          }

          const wordChars = textItem.chars.slice(startCharIndex, charIndex)
          if (wordChars.length === 0) continue

          const transformed = wordChars.map((char) => {
            const [a, b, c, d, e, f] = pdfjsLib.Util.transform(
              viewport.transform,
              char.transform
            )
            return {
              x: e,
              y: f,
              width: char.width * viewport.scale,
              height: d * viewport.scale,
            }
          })

          const minX = Math.min(...transformed.map((t) => t.x))
          const maxX = Math.max(...transformed.map((t) => t.x + t.width))
          const minY = Math.min(...transformed.map((t) => t.y - t.height))
          const maxY = Math.max(...transformed.map((t) => t.y))

          wordBoxes.push({
            str: word,
            bbox: {
              left: minX,
              top: minY,
              width: maxX - minX,
              height: (maxY - minY) * -1, // Flip height if needed
            },
          })
        }
      }

      setWords(wordBoxes)
    }

    void processPdf()
  }, [pdfPage])

  return { words }
}
