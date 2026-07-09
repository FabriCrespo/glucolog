import type { FoodItem, GlycemicLoadInfo } from "@/types/food";

export interface FoodBankUiState {
  searchTerm: string;
  showWithGlycemicIndex: boolean;
  selectedFood: FoodItem | null;
  portionSize: number;
  /** Último resultado calculado (se muestra en detalle y en el modal). */
  glycemicLoadSummary: GlycemicLoadInfo | null;
  /** Solo controla el overlay del modal; el resumen en tarjeta permanece. */
  glycemicModalOpen: boolean;
}

export type FoodBankAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_GI_FILTER" }
  | { type: "SELECT_FOOD"; payload: FoodItem }
  | { type: "CLEAR_FOOD" }
  | { type: "SET_PORTION"; payload: number }
  | { type: "GLYCEMIC_CALCULATED"; payload: GlycemicLoadInfo }
  | { type: "CLOSE_GLYCEMIC_MODAL" };

export const initialFoodBankState: FoodBankUiState = {
  searchTerm: "",
  showWithGlycemicIndex: false,
  selectedFood: null,
  portionSize: 100,
  glycemicLoadSummary: null,
  glycemicModalOpen: false,
};

export function foodBankReducer(
  state: FoodBankUiState,
  action: FoodBankAction
): FoodBankUiState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };

    case "TOGGLE_GI_FILTER":
      return { ...state, showWithGlycemicIndex: !state.showWithGlycemicIndex };

    case "SELECT_FOOD":
      return {
        ...state,
        selectedFood: action.payload,
        glycemicLoadSummary: null,
        glycemicModalOpen: false,
      };

    case "CLEAR_FOOD":
      return {
        ...state,
        selectedFood: null,
        glycemicLoadSummary: null,
        glycemicModalOpen: false,
      };

    case "SET_PORTION":
      return { ...state, portionSize: action.payload };

    case "GLYCEMIC_CALCULATED":
      return {
        ...state,
        glycemicLoadSummary: action.payload,
        glycemicModalOpen: true,
      };

    case "CLOSE_GLYCEMIC_MODAL":
      return { ...state, glycemicModalOpen: false };

    default:
      return state;
  }
}
