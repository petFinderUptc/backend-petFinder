/**
 * Catalogo unico de valores para el contrato v1 de reportes.
 *
 * Mantiene una sola fuente de verdad para species, type, status y size,
 * mientras preserva compatibilidad con los enums existentes.
 */

import { PetSize } from './pet-size.enum';
import { PetType } from './pet-type.enum';
import { PostStatus } from './post-status.enum';
import { PostType } from './post-type.enum';

export const ReportSpeciesValues = {
  DOG: PetType.DOG,
  CAT: PetType.CAT,
  BIRD: PetType.BIRD,
  RABBIT: PetType.RABBIT,
  OTHER: PetType.OTHER,
} as const;

export const ReportTypeValues = {
  LOST: PostType.LOST,
  FOUND: PostType.FOUND,
} as const;

export const ReportStatusValues = {
  ACTIVE: PostStatus.ACTIVE,
  RESOLVED: PostStatus.RESOLVED,
  INACTIVE: PostStatus.INACTIVE,
} as const;

export const ReportSizeValues = {
  SMALL: PetSize.SMALL,
  MEDIUM: PetSize.MEDIUM,
  LARGE: PetSize.LARGE,
} as const;

export const REPORT_ENUM_OPTIONS = {
  species: Object.values(ReportSpeciesValues),
  type: Object.values(ReportTypeValues),
  status: Object.values(ReportStatusValues),
  size: Object.values(ReportSizeValues),
} as const;

export type ReportSpecies = (typeof ReportSpeciesValues)[keyof typeof ReportSpeciesValues];
export type ReportType = (typeof ReportTypeValues)[keyof typeof ReportTypeValues];
export type ReportStatus = (typeof ReportStatusValues)[keyof typeof ReportStatusValues];
export type ReportSize = (typeof ReportSizeValues)[keyof typeof ReportSizeValues];
