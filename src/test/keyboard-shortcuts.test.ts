import { describe, it, expect } from 'vitest'
import { formatShortcut } from '@/lib/useKeyboardShortcuts'

describe('Keyboard Shortcuts', () => {
  describe('formatShortcut', () => {
    it('formats simple key', () => {
      const result = formatShortcut({
        key: 'f',
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('F')
    })
    
    it('formats Ctrl + key', () => {
      const result = formatShortcut({
        key: 'f',
        ctrl: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('Ctrl + F')
    })
    
    it('formats Ctrl + Shift + key', () => {
      const result = formatShortcut({
        key: 'v',
        ctrl: true,
        shift: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('Ctrl + Shift + V')
    })
    
    it('formats Alt + key', () => {
      const result = formatShortcut({
        key: 'x',
        alt: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('Alt + X')
    })
    
    it('formats Meta key (Mac Command)', () => {
      const result = formatShortcut({
        key: 's',
        meta: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('⌘ + S')
    })
    
    it('formats all modifiers combined', () => {
      const result = formatShortcut({
        key: 'a',
        ctrl: true,
        shift: true,
        alt: true,
        meta: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('Ctrl + Shift + Alt + ⌘ + A')
    })
    
    it('handles special keys like Escape', () => {
      const result = formatShortcut({
        key: 'Escape',
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('ESCAPE')
    })
    
    it('handles arrow keys', () => {
      const result = formatShortcut({
        key: 'ArrowLeft',
        ctrl: true,
        action: () => {},
        description: 'Test'
      })
      expect(result).toBe('Ctrl + ARROWLEFT')
    })
    
    it('handles Home and End keys', () => {
      const homeResult = formatShortcut({
        key: 'Home',
        ctrl: true,
        action: () => {},
        description: 'First page'
      })
      expect(homeResult).toBe('Ctrl + HOME')
      
      const endResult = formatShortcut({
        key: 'End',
        ctrl: true,
        action: () => {},
        description: 'Last page'
      })
      expect(endResult).toBe('Ctrl + END')
    })
    
    it('handles Delete key', () => {
      const result = formatShortcut({
        key: 'Delete',
        ctrl: true,
        action: () => {},
        description: 'Clear data'
      })
      expect(result).toBe('Ctrl + DELETE')
    })
    
    it('handles ? key with Shift', () => {
      const result = formatShortcut({
        key: '?',
        shift: true,
        action: () => {},
        description: 'Show shortcuts'
      })
      expect(result).toBe('Shift + ?')
    })
  })
  
  describe('KeyboardShortcut interface', () => {
    it('accepts minimal shortcut definition', () => {
      const shortcut = {
        key: 'a',
        action: () => console.log('pressed'),
        description: 'Press A'
      }
      
      expect(shortcut.key).toBe('a')
      expect(shortcut.description).toBe('Press A')
      expect(typeof shortcut.action).toBe('function')
    })
    
    it('accepts full shortcut definition', () => {
      const shortcut = {
        key: 's',
        ctrl: true,
        shift: true,
        alt: true,
        meta: true,
        action: () => console.log('pressed'),
        description: 'Complex shortcut'
      }
      
      expect(shortcut.ctrl).toBe(true)
      expect(shortcut.shift).toBe(true)
      expect(shortcut.alt).toBe(true)
      expect(shortcut.meta).toBe(true)
    })
  })
})
