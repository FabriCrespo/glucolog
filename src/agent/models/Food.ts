/**
 * Modelo limpio de alimento para el agente.
 * Nunca expone claves crudas de RTDB ni sentinels inválidos.
 */
export interface Food {
  Codigo: string;
  Nombre: string;
  Categoria: string;
  Calorias: number | null;
  Proteina: number | null;
  Grasa: number | null;
  Carbohidratos: number | null;
  Fibra: number | null;
  IndiceGlucemico: number | null;
  GramHCO: number | null;
}
