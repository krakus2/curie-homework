'use client'

import React from 'react'
import type { BBox } from '../libs/PDF'

type PhraseHighlightProps = {
  bbox: BBox
}

export const PhraseHighlight = ({ bbox }: PhraseHighlightProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: 4,
        backgroundColor: 'rgba(255, 165, 0, 0.6)',
        border: '2px solid orange',
        left: `${bbox.left - 4}px`,
        top: `${bbox.top - 2}px`,
        width: `${bbox.width + 8}px`,
        height: `${bbox.height + 4}px`,
        pointerEvents: 'none',
        transition: 'all 0.2s ease-in-out',
        zIndex: 10,
      }}
    />
  )
}
