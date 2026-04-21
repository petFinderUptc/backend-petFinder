import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VisionAnalysisResult {
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' | null;
  color: string | null;
  breed: string | null;
  confidence: 'high' | 'medium' | 'low';
  aiAvailable: boolean;
  message?: string;
}

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private readonly genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<VisionAnalysisResult> {
    if (!this.genAI) {
      return {
        species: null,
        color: null,
        breed: null,
        confidence: 'low',
        aiAvailable: false,
        message: 'El análisis de imagen por IA no está disponible en este momento.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analiza esta imagen de una mascota y responde ÚNICAMENTE con un JSON válido sin markdown ni texto adicional.
Campos:
- "species": uno de "dog","cat","bird","rabbit","other" o null si no hay animal visible
- "color": color principal del animal (texto corto en español) o null
- "breed": raza estimada en español o null si no es identificable con certeza
- "confidence": "high" si estás muy seguro, "medium" si es probable, "low" si hay duda

Ejemplo: {"species":"dog","color":"marrón con blanco","breed":"Labrador","confidence":"high"}
Si no ves un animal claro, usa null para species.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
          },
        },
      ]);

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Respuesta de Gemini no contiene JSON válido');

      const parsed = JSON.parse(jsonMatch[0]) as {
        species?: string;
        color?: string;
        breed?: string;
        confidence?: string;
      };

      const VALID_SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'other'];
      const species = VALID_SPECIES.includes(parsed.species ?? '')
        ? (parsed.species as VisionAnalysisResult['species'])
        : null;

      const confidence = (['high', 'medium', 'low'] as const).includes(
        parsed.confidence as 'high' | 'medium' | 'low',
      )
        ? (parsed.confidence as VisionAnalysisResult['confidence'])
        : 'low';

      let message: string | undefined;
      if (!species) {
        message =
          'No se detectó ningún animal en la imagen. Por favor selecciona la especie manualmente.';
      } else if (species === 'other') {
        message =
          'La IA detectó un animal pero no pudo identificar la especie exacta. Puedes cambiarla manualmente.';
      } else if (confidence === 'low') {
        message =
          'La detección es de baja confianza. Verifica y ajusta los campos si es necesario.';
      }

      return {
        species,
        color: parsed.color?.trim() || null,
        breed: parsed.breed?.trim() || null,
        confidence,
        aiAvailable: true,
        message,
      };
    } catch (error) {
      this.logger.warn(`Error en análisis de imagen: ${error.message}`);
      return {
        species: null,
        color: null,
        breed: null,
        confidence: 'low',
        aiAvailable: true,
        message: 'No se pudo analizar la imagen automáticamente. Completa los campos manualmente.',
      };
    }
  }
}
