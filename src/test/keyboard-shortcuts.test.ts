import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { formatShortcut, useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts'

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

  describe('useKeyboardShortcuts hook', () => {
    const createKeyboardEvent = (key: string, options: Partial<KeyboardEventInit> = {}) => {
      return new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...options,
      })
    }

    it('should call action when shortcut key is pressed', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', action: mockAction, description: 'Test' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f'))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should call action when Ctrl + key is pressed', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', ctrl: true, action: mockAction, description: 'Find' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f', { ctrlKey: true }))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should not call action when Ctrl is required but not pressed', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', ctrl: true, action: mockAction, description: 'Find' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f', { ctrlKey: false }))
      })

      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should handle Shift modifier', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: '?', shift: true, action: mockAction, description: 'Help' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('?', { shiftKey: true }))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle Alt modifier', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'x', alt: true, action: mockAction, description: 'Alt X' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('x', { altKey: true }))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple modifiers', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 's', ctrl: true, shift: true, action: mockAction, description: 'Save As' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('s', { ctrlKey: true, shiftKey: true }))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should not trigger when disabled', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', action: mockAction, description: 'Test' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f'))
      })

      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should handle case-insensitive key matching', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'F', action: mockAction, description: 'Test' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f'))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should return the shortcuts array', () => {
      const shortcuts = [
        { key: 'a', action: vi.fn(), description: 'Test A' },
        { key: 'b', action: vi.fn(), description: 'Test B' },
      ]

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts))

      expect(result.current.shortcuts).toEqual(shortcuts)
      expect(result.current.shortcuts).toHaveLength(2)
    })

    it('should handle metaKey (Mac Command) as ctrl equivalent', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', ctrl: true, action: mockAction, description: 'Find' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('f', { metaKey: true }))
      })

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple shortcuts', () => {
      const mockAction1 = vi.fn()
      const mockAction2 = vi.fn()
      const shortcuts = [
        { key: 'a', action: mockAction1, description: 'Action A' },
        { key: 'b', action: mockAction2, description: 'Action B' },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        window.dispatchEvent(createKeyboardEvent('a'))
      })

      expect(mockAction1).toHaveBeenCalledTimes(1)
      expect(mockAction2).not.toHaveBeenCalled()

      act(() => {
        window.dispatchEvent(createKeyboardEvent('b'))
      })

      expect(mockAction2).toHaveBeenCalledTimes(1)
    })

    it('should prevent default on matched shortcuts', () => {
      const mockAction = vi.fn()
      const shortcuts = [
        { key: 'f', ctrl: true, action: mockAction, description: 'Find' }
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = createKeyboardEvent('f', { ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      act(() => {
        window.dispatchEvent(event)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })
})
