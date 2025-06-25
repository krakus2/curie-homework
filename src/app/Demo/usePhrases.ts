'use client'

import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-lib'
import { type TextItem } from 'pdfjs-dist/types/src/display/api'
import { usePDFContext, type WordBox } from '../libs/PDF'

export const usePhrases = () => {
  const [phrases, setPhrases] = useState<WordBox[]>([])

  const { pdfPage } = usePDFContext()

  useEffect(() => {
    const processPdf = async () => {
      if (!pdfPage) return

      const viewport = pdfPage.getViewport({ scale: 1.5 })
      const textContent = await pdfPage.getTextContent()

      const wordBoxes: WordBox[] = []

      for (const item of textContent.items) {
        const textItem = item as TextItem

        // INFO: Only include items with at least one letter (a-z, A-Z)
        if (!textItem.str || !/[a-zA-Z]/.test(textItem.str)) {
          continue
        }

        // INFO: Transform item to viewport coordinates
        const transform = pdfjsLib.Util.transform(
          viewport.transform,
          textItem.transform
        ) as number[]

        const x = transform[4]
        const y = transform[5]
        const width = textItem.width * viewport.scale
        const height = textItem.height * viewport.scale

        wordBoxes.push({
          str: textItem.str,
          bbox: {
            left: x,
            // TODO: Magic number, to be determined why we need it
            top: y - 16,
            width,
            height,
          },
        })
      }

      setPhrases(wordBoxes)
    }

    void processPdf()
  }, [pdfPage])

  return { phrases }
}
