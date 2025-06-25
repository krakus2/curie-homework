'use client'

import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-lib'
import { type TextItem } from 'pdfjs-dist/types/src/display/api'
import { usePDFContext, type HighlightBox } from '../libs/PDF'

type TextItemWithCharsCoordinates = TextItem & {
  chars: Array<{
    char: string
    unicode: string
    transform: number[]
    width: number
  }>
}

export const useWords = () => {
  const [words, setWords] = useState<HighlightBox[]>([])
  const { pdfPage } = usePDFContext()

  useEffect(() => {
    const processPdf = async () => {
      if (!pdfPage) return

      const viewport = pdfPage.getViewport({ scale: 1.5 })
      const textContent = await pdfPage.getTextContent()

      const highlightBoxes: HighlightBox[] = []

      for (const item of textContent.items) {
        console.log({ item })
        const textItem = item as TextItemWithCharsCoordinates

        if (!textItem.str || !textItem.chars || textItem.chars.length === 0) {
          continue
        }

        const wordsInString = textItem.str.split(/\s+/)

        let charIndex = 0

        for (const word of wordsInString) {
          if (!word) continue

          const startCharIndex = charIndex
          let charsUsed = 0

          // INFO: Try to match characters in `chars` with current word length
          while (charIndex < textItem.chars.length && charsUsed < word.length) {
            charsUsed += textItem.chars[charIndex].unicode.length
            charIndex++
          }

          const wordChars = textItem.chars.slice(startCharIndex, charIndex)
          if (wordChars.length === 0) continue

          const transformed = wordChars.map((char) => {
            const transform = pdfjsLib.Util.transform(
              viewport.transform,
              char.transform
            )

            // TODO: For some reason that value is skewed; check worker patch
            const x = transform[4]
            const y = transform[5]
            return {
              left: x,
              right: x + char.width * viewport.scale,
              bottom: y,
            }
          })

          const minX = Math.min(...transformed.map((t) => t.left))
          const maxX = Math.max(...transformed.map((t) => t.right))
          const minY = Math.min(...transformed.map((t) => t.bottom))

          highlightBoxes.push({
            str: word,
            bbox: {
              left: minX,
              // TODO: Magic number, to be determined why we need it
              top: minY - 16,
              width: maxX - minX,
              height: textItem.height * viewport.scale,
            },
          })
        }
      }

      setWords(highlightBoxes)
    }

    void processPdf()
  }, [pdfPage])

  return { words }
}
