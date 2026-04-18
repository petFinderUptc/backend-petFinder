import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Gemini Embedding Service initialized');
    } else {
      this.logger.warn('⚠️  GEMINI_API_KEY not configured — semantic search disabled');
    }
  }

  /**
   * Genera un vector de embedding para el texto dado usando Gemini text-embedding-004.
   * Retorna [] si la API no está configurada o falla (fallback seguro).
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) return [];

    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text.trim());
      return result.embedding.values;
    } catch (error) {
      this.logger.warn(`Error generando embedding: ${error.message}`);
      return [];
    }
  }

  /**
   * Calcula la similitud coseno entre dos vectores.
   * Retorna un valor entre 0 (sin similitud) y 1 (idénticos).
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  /**
   * Construye el texto de embedding concatenando los campos descriptivos del reporte.
   */
  buildReportText(report: {
    species: string;
    color: string;
    breed: string;
    size: string;
    description: string;
  }): string {
    return [report.species, report.color, report.breed, report.size, report.description]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  /**
   * Calcula la distancia en km entre dos coordenadas usando la fórmula Haversine.
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(3));
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }

  /**
   * Analiza una foto de mascota con Gemini Vision y extrae sus características.
   * Retorna null si la API no está disponible o la imagen no es procesable.
   */
  async analyzePhoto(
    buffer: Buffer,
    mimeType: string,
  ): Promise<{
    species: string;
    breed: string;
    color: string;
    size: string;
    description: string;
  } | null> {
    if (!this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const base64 = buffer.toString('base64');

      const prompt = `Analiza esta foto de una mascota y responde ÚNICAMENTE con un objeto JSON válido con estos campos exactos:
{
  "species": "uno exacto de: dog, cat, bird, rabbit, other",
  "breed": "raza en español (ej: Labrador Dorado, Mestizo, Siamés, desconocida)",
  "color": "color(es) del pelaje en español (ej: café y blanco, negro, anaranjado)",
  "size": "uno exacto de: small, medium, large",
  "description": "2-3 oraciones describiendo rasgos distintivos: marcas, collar, postura, estado de salud aparente, en español"
}
No incluyas ningún texto fuera del JSON. Si no puedes determinar un campo con certeza, usa el valor más probable.`;

      const result = await model.generateContent([
        { inlineData: { data: base64, mimeType } },
        prompt,
      ]);

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      // Validar que los enums sean correctos
      const validSpecies = ['dog', 'cat', 'bird', 'rabbit', 'other'];
      const validSizes = ['small', 'medium', 'large'];
      if (!validSpecies.includes(parsed.species)) parsed.species = 'other';
      if (!validSizes.includes(parsed.size)) parsed.size = 'medium';

      return {
        species: parsed.species,
        breed: String(parsed.breed || '').slice(0, 60),
        color: String(parsed.color || '').slice(0, 50),
        size: parsed.size,
        description: String(parsed.description || '').slice(0, 500),
      };
    } catch (error) {
      this.logger.warn(`Error en análisis de foto con Vision: ${error.message}`);
      return null;
    }
  }

  /**
   * Genera un resumen breve de un reporte para compartir en redes sociales.
   * Retorna null si la API no está disponible.
   */
  async generateReportSummary(report: {
    species: string;
    type: string;
    breed: string;
    color: string;
    size: string;
    description: string;
  }): Promise<string | null> {
    if (!this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const speciesMap: Record<string, string> = {
        dog: 'perro',
        cat: 'gato',
        bird: 'ave',
        rabbit: 'conejo',
        other: 'mascota',
      };
      const typeMap: Record<string, string> = { lost: 'perdido', found: 'encontrado' };
      const sizeMap: Record<string, string> = {
        small: 'pequeño',
        medium: 'mediano',
        large: 'grande',
      };

      const prompt = `Genera un resumen breve en español (máximo 3 oraciones) sobre esta mascota para publicar en redes sociales y ayudar a encontrarla.
Datos: ${speciesMap[report.species] ?? 'mascota'} ${typeMap[report.type] ?? ''}, raza: ${report.breed}, color: ${report.color}, tamaño: ${sizeMap[report.size] ?? report.size}.
Descripción original: ${report.description}
El resumen debe ser conciso, claro y destacar los rasgos más útiles para identificar la mascota. Solo el texto, sin comillas, sin formato adicional.`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();
      return summary.slice(0, 600) || null;
    } catch (error) {
      this.logger.warn(`Error generando resumen IA: ${error.message}`);
      return null;
    }
  }
}
