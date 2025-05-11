export interface FoodItem {
  Codigo: string;
  Nombre: string;
  Agua: number;
  Calorias: number;
  Proteina: number;
  Grasa: number;
  Carbohidratos: number;
  Fibra: number;
  Calcio: number;
  Potasio: number;
  Zinc: number;
  Magnesio: number;
  VitaminaB6: number;
  VitaminaB12: number;
  AcidoFolico: number;
  FolatoEquivFD: number;
  FraccionComestible: number;
  Categoria: string;
  CarbohidratosNetos: number;
  ClasificacionCarbohidratos: string;
  IndiceGlucemico?: number;
  GramHCO?: number;
}

export interface GlycemicLoadInfo {
  value: number;
  category: 'Baja' | 'Media' | 'Alta';
}

export interface NutrientDensity {
  caloriesPer100g: number;
  proteinDensity: number;
  fiberDensity: number;
  mineralDensity: number;
  vitaminDensity: number;
}

export interface MicronutrientStatus {
  magnesium: { value: number; status: 'low' | 'good' | 'high' };
  zinc: { value: number; status: 'low' | 'good' | 'high' };
  calcium: { value: number; status: 'low' | 'good' | 'high' };
  potassium: { value: number; status: 'low' | 'good' | 'high' };
}

export interface NutritionalRecommendation {
  type: 'complement' | 'caution' | 'tip';
  message: string;
}