import { Location } from './location.vo';

describe('Location Value Object', () => {
  describe('constructor & validation', () => {
    it('should create a valid location', () => {
      const loc = new Location('Tunja', 'Centro', 'Calle 1 #2-3', {
        latitude: 5.535,
        longitude: -73.367,
      });
      expect(loc.city).toBe('Tunja');
      expect(loc.neighborhood).toBe('Centro');
      expect(loc.address).toBe('Calle 1 #2-3');
      expect(loc.coordinates?.latitude).toBe(5.535);
    });

    it('should create location without optional fields', () => {
      const loc = new Location('Bogotá', 'Chapinero');
      expect(loc.address).toBeUndefined();
      expect(loc.coordinates).toBeUndefined();
    });

    it('should throw if city is empty', () => {
      expect(() => new Location('', 'Centro')).toThrow('La ciudad es requerida');
    });

    it('should throw if neighborhood is empty', () => {
      expect(() => new Location('Tunja', '')).toThrow('El barrio es requerido');
    });

    it('should throw if latitude is out of range', () => {
      expect(
        () => new Location('Tunja', 'Centro', undefined, { latitude: 100, longitude: 0 }),
      ).toThrow('Latitud inválida');
    });

    it('should throw if longitude is out of range', () => {
      expect(
        () => new Location('Tunja', 'Centro', undefined, { latitude: 5, longitude: 200 }),
      ).toThrow('Longitud inválida');
    });
  });

  describe('equals', () => {
    it('should return true for identical locations', () => {
      const loc1 = new Location('Tunja', 'Centro', 'Calle 1');
      const loc2 = new Location('Tunja', 'Centro', 'Calle 1');
      expect(loc1.equals(loc2)).toBe(true);
    });

    it('should return false for different locations', () => {
      const loc1 = new Location('Tunja', 'Centro');
      const loc2 = new Location('Bogotá', 'Chapinero');
      expect(loc1.equals(loc2)).toBe(false);
    });
  });

  describe('toPlainObject', () => {
    it('should serialize correctly', () => {
      const loc = new Location('Tunja', 'Centro', 'Calle 1', { latitude: 5.5, longitude: -73.3 });
      const plain = loc.toPlainObject();
      expect(plain.city).toBe('Tunja');
      expect(plain.coordinates?.latitude).toBe(5.5);
    });
  });
});
