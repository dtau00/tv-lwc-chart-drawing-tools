import { describe, it, expect } from 'vitest'
import { toolKeyName, subToolKeyName, subToolValueKeyName } from '../src/common/tool-key.ts' // adjust path as needed

describe('toolKeyName', () => {
    it('should return correct key', () => {
      expect(toolKeyName('brush')).toBe('tool_options_override_brush')
    })
  
    it('should throw on empty string', () => {
      expect(() => toolKeyName('')).toThrowError('Invalid name')
    })
  
    it('should throw on non-string input', () => {
      // @ts-expect-error for test purposes
      expect(() => toolKeyName(null)).toThrow()
    })
  })
  
  describe('subToolKeyName', () => {
    it('should return correct key', () => {
      expect(subToolKeyName('brush', 'size')).toBe('selected-subtool-brush-size')
    })
  
    it('should throw on empty parentTool', () => {
      expect(() => subToolKeyName('', 'size')).toThrowError('Invalid parentTool')
    })
  
    it('should throw on empty propertyName', () => {
      expect(() => subToolKeyName('brush', '')).toThrowError('Invalid propertyName')
    })
  })
  
  describe('subToolValueKeyName', () => {
    it('should return correct key', () => {
      expect(subToolValueKeyName('brush', 'size', 2)).toBe('subtool-val-brush-size-2')
    })
  
    it('should throw on invalid index', () => {
      expect(() => subToolValueKeyName('brush', 'size', -1)).toThrowError('Invalid index')
      expect(() => subToolValueKeyName('brush', 'size', 1.5)).toThrowError('Invalid index')
    })
  
    it('should throw on empty parentTool or propertyName', () => {
      expect(() => subToolValueKeyName('', 'size', 0)).toThrow()
      expect(() => subToolValueKeyName('brush', '', 0)).toThrow()
    })
  })
  