/**
 * Value Object: Location (Ubicación)
 *
 * Representa una ubicación geográfica con sus coordenadas.
 * Value Object inmutable con reglas de validación encapsuladas.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class Location {
  constructor(
    public readonly city: string,
    public readonly neighborhood: string,
    public readonly address?: string,
    public readonly coordinates?: Coordinates,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.city || this.city.trim().length === 0) {
      throw new Error('La ciudad es requerida');
    }
    if (!this.neighborhood || this.neighborhood.trim().length === 0) {
      throw new Error('El barrio es requerido');
    }
    if (this.coordinates) {
      this.validateCoordinates(this.coordinates);
    }
  }

  private validateCoordinates(coords: Coordinates): void {
    if (coords.latitude < -90 || coords.latitude > 90) {
      throw new Error('Latitud inválida');
    }
    if (coords.longitude < -180 || coords.longitude > 180) {
      throw new Error('Longitud inválida');
    }
  }

  /**
   * Compara dos ubicaciones
   */
  equals(other: Location): boolean {
    return (
      this.city === other.city &&
      this.neighborhood === other.neighborhood &&
      this.address === other.address &&
      JSON.stringify(this.coordinates) === JSON.stringify(other.coordinates)
    );
  }

  /**
   * Convierte el Value Object a un objeto plano
   */
  toPlainObject() {
    return {
      city: this.city,
      neighborhood: this.neighborhood,
      address: this.address,
      coordinates: this.coordinates,
    };
  }
}
