/// <reference types="react" />
'use client'

import React, { useState, useEffect } from 'react'
import { Lock, Unlock, HelpCircle, Download, Trash2, X, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as htmlToImage from 'html-to-image'
import jsPDF from 'jspdf'
import * as Dialog from '@radix-ui/react-dialog'
import type { LucideIcon } from 'lucide-react'

interface IconProps extends React.ComponentProps<LucideIcon> {
  className?: string;
}

interface DialogComponentProps extends Dialog.DialogProps {
  className?: string;
}

interface DialogTriggerComponentProps extends Dialog.DialogTriggerProps {
  asChild?: boolean;
}

interface DialogCloseComponentProps extends Dialog.DialogCloseProps {
  asChild?: boolean;
}

const HIGHLIGHTED_POSITIONS = [
  // Surrounding positions
  30, 31, 32, 39, 41, 48, 49, 50,
  // Center positions of each grid
  10, 13, 16, 37, 43, 64, 67, 70
]

const CHARACTER_LIMIT = 50

interface Size {
  width: number;
  height: number;
}

const MandalartPlanner = () => {
  const [goals, setGoals] = useState(Array(81).fill(''))
  const [isLocked, setIsLocked] = useState(false)
  const [gridSize, setGridSize] = useState({ width: 1200, height: 1200 })
  const [userName, setUserName] = useState<string>('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [showMobileWarning, setShowMobileWarning] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const isMobileOrTablet = window.innerWidth < 1024;
      setShowMobileWarning(isMobileOrTablet);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleGoalChange = (index: number, value: string) => {
    if (value.length > CHARACTER_LIMIT) {
      return;
    }

    const newGoals = [...goals]
    
    const mainToGridCenter: Record<number, number> = {
      30: 10,
      31: 13,
      32: 16,
      39: 37,
      41: 43,
      48: 64,
      49: 67,
      50: 70
    }

    newGoals[index] = value

    if (index in mainToGridCenter) {
      newGoals[mainToGridCenter[index]] = value
    }

    setGoals(newGoals)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all goals?')) {
      setGoals(Array(81).fill(''))
    }
  }

  const toggleLock = () => {
    setIsLocked(!isLocked)
  }

  const handleNameInput = () => {
    const name = prompt('What is your name? 🌟')
    if (name) {
      setUserName(name)
      const newGoals = [...goals]
      newGoals[40] = name
      setGoals(newGoals)
    }
  }

  const handleInstructionClick = () => {
    setShowInstructions(true)
  }

  const handleDownloadPDF = async () => {
    if (!userName) {
      alert('Please enter your name first!')
      return
    }

    try {
      const gridElement = document.querySelector('.grid-container') as HTMLElement
      if (!gridElement) {
        throw new Error('Grid element not found')
      }

      // Store current opacity values
      const textareas = gridElement.querySelectorAll('textarea')
      const originalOpacities = Array.from(textareas).map(textarea => textarea.style.opacity)
      
      // Set all textareas to full opacity for PDF
      textareas.forEach(textarea => {
        textarea.style.opacity = '1'
      })

      const imageData = await htmlToImage.toPng(gridElement, {
        quality: 1,
        backgroundColor: '#f0e7db',
        pixelRatio: 2,
        filter: (node) => {
          return !node.classList?.contains('pdf-hide');
        }
      })

      // Restore original opacity values
      textareas.forEach((textarea, index) => {
        textarea.style.opacity = originalOpacities[index]
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [gridSize.width + 32, gridSize.height + 32]
      })

      pdf.addImage(imageData, 'PNG', 16, 16, gridSize.width, gridSize.height)
      pdf.save(`${userName}-mandalart.pdf`)
      alert('PDF downloaded successfully!')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF')
    }
  }

  return (
    <>
      {showMobileWarning ? (
        <div className="min-h-screen bg-[#f0e7db] flex items-center justify-center">
          <Dialog.Root open={true}>
            <Dialog.Portal>
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f0e7db] p-12 rounded-lg shadow-lg max-w-5xl w-[90vw] text-xl">
                <div className="space-y-6 text-[#5c4b51]">
                  <div className="mb-8">
                    <div className="flex items-center justify-center mb-6">
                      <Coffee className="h-16 w-16 text-[#8a7a6a]" />
                    </div>
                    <Dialog.Title className="text-4xl font-bold text-[#5c4b51] text-center mb-6">Take a Coffee Break! ☕</Dialog.Title>
                    <p className="text-xl text-center">Please grab coffee with lofi music and enjoy it on desktop version for productivity :)</p>
                  </div>
                  <div className="mt-6 p-6 bg-[#e0d5c5] rounded-lg">
                    <p className="font-bold mb-4 text-2xl">💡 Note</p>
                    <p>This app is optimized for desktop viewing to ensure the best planning experience. We recommend using a device with a larger screen.</p>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      ) : (
        <div className="min-h-screen bg-[#f0e7db] flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-[#5c4b51]">Mandalart Planner</h1>
            
            <Dialog.Root open={showInstructions} onOpenChange={setShowInstructions}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-transparent"
                >
                  <HelpCircle className="h-8 w-8 text-[#5c4b51]" />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f0e7db] p-12 rounded-lg shadow-lg max-w-5xl w-[90vw] text-xl max-h-[85vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <Dialog.Title className="text-4xl font-bold text-[#5c4b51]">How to Use</Dialog.Title>
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-transparent">
                        <X className="h-8 w-8 text-[#5c4b51]" />
                      </Button>
                    </Dialog.Close>
                  </div>
                  <div className="space-y-6 text-[#5c4b51]">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">What is Mandalart?</h2>
                      <p>A goal-setting tool using a 9×9 grid. Your main goal sits in the center, surrounded by 8 primary goals. Each primary goal expands into 8 sub-goals, helping you break down your objectives into actionable steps.</p>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Steps to Create</h2>
                      <div className="space-y-3">
                        <p>1. Click the center box to enter your name (required for PDF export)</p>
                        <p>2. Fill in your 8 main goals in the highlighted boxes around your name</p>
                        <p>3. Your main goals will automatically appear in the center of their respective grids</p>
                        <p>4. Add sub-goals in the surrounding boxes of each grid</p>
                        <p>5. Click the lock icon to prevent accidental edits (grid will appear semi-transparent)</p>
                        <p>6. Use the download button to save your plan as a PDF</p>
                      </div>
                    </div>
                    <div className="mt-6 p-6 bg-[#e0d5c5] rounded-lg">
                      <p className="font-bold mb-4 text-2xl">💡 Tips</p>
                      <ul className="list-disc pl-6 space-y-3">
                        <li>Each box has a {CHARACTER_LIMIT}-character limit</li>
                        <li>The character counter appears when you start typing</li>
                        <li>You can unlock the grid anytime to make changes</li>
                        <li>Your PDF will show the grid in full clarity, even when locked</li>
                        <li>Clear all goals using the trash icon if you want to start over</li>
                      </ul>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          
          <div className="relative">
            <Button
              onClick={toggleLock}
              className="absolute -right-12 top-0 bg-[#8a7a6a] text-[#f0e7db] hover:bg-[#7a6a5a] p-2"
              size="sm"
            >
              {isLocked ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
            </Button>

            <Button
              onClick={handleClear}
              className="absolute -right-12 top-12 bg-[#8a7a6a] text-[#f0e7db] hover:bg-[#7a6a5a] p-2"
              size="sm"
            >
              <Trash2 className="h-6 w-6" />
            </Button>

            <div className="w-[1200px] h-[1200px] bg-[#e0d5c5] p-4 rounded-lg shadow-lg">
              <div className="grid-container w-full h-full grid grid-cols-9 gap-1">
                {Array(81).fill(null).map((_, index) => {
                  const col = index % 9
                  const row = Math.floor(index / 9)
                  const isRightEdge = col % 3 === 2 && col !== 8
                  const isBottomEdge = row % 3 === 2 && row !== 8

                  return (
                    <div key={index} className="relative w-full h-full">
                      <textarea
                        key={index}
                        maxLength={CHARACTER_LIMIT}
                        className={`w-full h-full resize-none overflow-hidden
                          ${HIGHLIGHTED_POSITIONS.includes(index) ? 'bg-[#c0b5a5]' : 'bg-[#d0c5b5]'} text-[#5c4b51]
                          ${[40].includes(index) ? 'bg-[#d0c5b5] text-[#5c4b51] font-bold cursor-pointer' : ''}
                          ${isRightEdge ? 'border-r-2 border-r-[#8a7a6a]' : ''}
                          ${isBottomEdge ? 'border-b-2 border-b-[#8a7a6a]' : ''}
                          border border-[#a09080] rounded focus:outline-none focus:ring-2 focus:ring-[#8a7a6a]
                          ${[40].includes(index) ? 'placeholder:text-[#5c4b51] placeholder:font-bold' : ''}
                          only-screen`}
                        placeholder={[40].includes(index) ? 'Click' : ''}
                        value={goals[index]}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleGoalChange(index, e.target.value)}
                        onClick={() => index === 40 && !isLocked && handleNameInput()}
                        disabled={isLocked}
                        aria-label={`Goal ${index + 1}`}
                        style={{ 
                          fontSize: `${gridSize.width / 1000}rem`,
                          lineHeight: '1.2',
                          padding: '0',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          textAlign: 'center',
                          width: '100%',
                          height: '100%',
                          resize: 'none',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingTop: '40%',
                          ...(isLocked && { opacity: '0.5' })
                        }}
                      />
                      {goals[index]?.length > 0 && (
                        <div className="absolute bottom-0 right-0 text-xs text-[#5c4b51] opacity-50 p-1 pdf-hide">
                          {goals[index]?.length}/{CHARACTER_LIMIT}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button 
              onClick={handleDownloadPDF}
              className="bg-[#8a7a6a] text-[#f0e7db] hover:bg-[#7a6a5a] px-6 py-6 text-lg"
            >
              <Download className="mr-3 h-5 w-5" />
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default MandalartPlanner

