import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'
import type { ProcessedData } from '@/types'

// Mock data for testing
const mockData: ProcessedData = {
  schema: {
    id: 'test-schema',
    name: 'Test Data',
    columns: [
      { key: 'id', label: 'ID', format: { type: 'string' }, sortable: true, searchable: true },
      { key: 'name', label: 'Nome', format: { type: 'string' }, sortable: true, searchable: true },
      { key: 'price', label: 'Preço', format: { type: 'currency', currency: 'BRL' }, sortable: true, searchable: false },
      { key: 'active', label: 'Ativo', format: { type: 'boolean' }, sortable: false, searchable: false },
      { key: 'progress', label: 'Progresso', format: { type: 'progress' }, sortable: true, searchable: false },
    ],
  },
  rows: [
    { _id: 'row-1', _rowIndex: 0, id: '001', name: 'Item A', price: 100, active: true, progress: 50 },
    { _id: 'row-2', _rowIndex: 1, id: '002', name: 'Item B', price: 200, active: false, progress: 75 },
    { _id: 'row-3', _rowIndex: 2, id: '003', name: 'Item C', price: 300, active: true, progress: 100 },
  ],
  metadata: {
    totalRows: 3,
    processedAt: new Date(),
    sourceFileName: 'test.xlsx',
  },
}

describe('Inline Editing Feature', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAppStore.getState()
    store.clearData()
    store.setData(mockData)
  })

  describe('Edit Mode', () => {
    it('starts with edit mode disabled', () => {
      const state = useAppStore.getState()
      expect(state.isEditMode).toBe(false)
    })

    it('enables edit mode', () => {
      const store = useAppStore.getState()
      store.setEditMode(true)
      
      const state = useAppStore.getState()
      expect(state.isEditMode).toBe(true)
    })

    it('disables edit mode', () => {
      const store = useAppStore.getState()
      store.setEditMode(true)
      store.setEditMode(false)
      
      const state = useAppStore.getState()
      expect(state.isEditMode).toBe(false)
    })

    it('clears editing cell when disabling edit mode', () => {
      const store = useAppStore.getState()
      store.setEditMode(true)
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      store.setEditMode(false)
      
      const state = useAppStore.getState()
      expect(state.editingCell).toBe(null)
    })
  })

  describe('Editing Cell State', () => {
    it('starts with no cell being edited', () => {
      const state = useAppStore.getState()
      expect(state.editingCell).toBe(null)
    })

    it('sets editing cell correctly', () => {
      const store = useAppStore.getState()
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      
      const state = useAppStore.getState()
      expect(state.editingCell).toEqual({ rowId: 'row-1', columnKey: 'name' })
    })

    it('clears editing cell', () => {
      const store = useAppStore.getState()
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      store.setEditingCell(null)
      
      const state = useAppStore.getState()
      expect(state.editingCell).toBe(null)
    })

    it('changes editing cell to a different cell', () => {
      const store = useAppStore.getState()
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      store.setEditingCell({ rowId: 'row-2', columnKey: 'price' })
      
      const state = useAppStore.getState()
      expect(state.editingCell).toEqual({ rowId: 'row-2', columnKey: 'price' })
    })
  })

  describe('Cell Updates', () => {
    it('updates a text cell value', () => {
      const store = useAppStore.getState()
      store.updateCell('row-1', 'name', 'Updated Item A')
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-1')
      expect(row?.name).toBe('Updated Item A')
    })

    it('updates a numeric cell value', () => {
      const store = useAppStore.getState()
      store.updateCell('row-2', 'price', 999)
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-2')
      expect(row?.price).toBe(999)
    })

    it('updates a boolean cell value', () => {
      const store = useAppStore.getState()
      store.updateCell('row-1', 'active', false)
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-1')
      expect(row?.active).toBe(false)
    })

    it('updates a progress cell value', () => {
      const store = useAppStore.getState()
      store.updateCell('row-3', 'progress', 25)
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-3')
      expect(row?.progress).toBe(25)
    })

    it('sets cell value to null', () => {
      const store = useAppStore.getState()
      store.updateCell('row-1', 'name', null)
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-1')
      expect(row?.name).toBe(null)
    })

    it('clears editing cell after update', () => {
      const store = useAppStore.getState()
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      store.updateCell('row-1', 'name', 'New Value')
      
      const state = useAppStore.getState()
      expect(state.editingCell).toBe(null)
    })

    it('does not affect other rows when updating', () => {
      const store = useAppStore.getState()
      store.updateCell('row-1', 'name', 'Changed')
      
      const state = useAppStore.getState()
      const row2 = state.data?.rows.find(r => r._id === 'row-2')
      const row3 = state.data?.rows.find(r => r._id === 'row-3')
      
      expect(row2?.name).toBe('Item B')
      expect(row3?.name).toBe('Item C')
    })

    it('does not affect other columns when updating', () => {
      const store = useAppStore.getState()
      store.updateCell('row-1', 'name', 'Changed')
      
      const state = useAppStore.getState()
      const row = state.data?.rows.find(r => r._id === 'row-1')
      
      expect(row?.id).toBe('001')
      expect(row?.price).toBe(100)
      expect(row?.active).toBe(true)
    })

    it('handles update when data is null gracefully', () => {
      const store = useAppStore.getState()
      store.clearData()
      
      // Should not throw
      expect(() => {
        store.updateCell('row-1', 'name', 'Value')
      }).not.toThrow()
      
      const state = useAppStore.getState()
      expect(state.data).toBe(null)
    })

    it('handles update for non-existent row gracefully', () => {
      const store = useAppStore.getState()
      
      // Should not throw
      expect(() => {
        store.updateCell('non-existent', 'name', 'Value')
      }).not.toThrow()
      
      // Other rows remain unchanged
      const state = useAppStore.getState()
      const row1 = state.data?.rows.find(r => r._id === 'row-1')
      expect(row1?.name).toBe('Item A')
    })
  })

  describe('Edit Mode Reset on New Data', () => {
    it('resets edit mode when new data is loaded', () => {
      const store = useAppStore.getState()
      store.setEditMode(true)
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      
      // Load new data
      store.setData(mockData)
      
      const state = useAppStore.getState()
      expect(state.isEditMode).toBe(false)
      expect(state.editingCell).toBe(null)
    })

    it('resets edit mode when data is cleared', () => {
      const store = useAppStore.getState()
      store.setEditMode(true)
      store.setEditingCell({ rowId: 'row-1', columnKey: 'name' })
      
      store.clearData()
      
      const state = useAppStore.getState()
      expect(state.isEditMode).toBe(false)
      expect(state.editingCell).toBe(null)
    })
  })
})
