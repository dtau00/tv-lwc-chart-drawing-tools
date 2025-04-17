import { describe, it, expect, beforeEach } from 'vitest'
import { DataStorage } from '../src/common/storage';


describe('DataStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load data correctly', () => {
    const key = 'testKey';
    const testData = { name: 'Alice', age: 30 };

    DataStorage.saveData(key, testData);
    const result = DataStorage.loadData(key, {});

    expect(result).toEqual(testData);
  });

  it('should return default value if key is not found', () => {
    const result = DataStorage.loadData('nonExistentKey', { fallback: true });
    expect(result).toEqual({ fallback: true });
  });

  it('should overwrite existing data when saving again', () => {
    const key = 'testKey';
    DataStorage.saveData(key, { a: 1 });
    DataStorage.saveData(key, { b: 2 });

    const result = DataStorage.loadData(key, {});
    expect(result).toEqual({ b: 2 });
  });
});