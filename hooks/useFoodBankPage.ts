"use client";

import type { User } from "firebase/auth";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
} from "react";
import {
  calculateMicronutrientStatus,
  calculateNutrientDensity,
  computeGlycemicLoad,
  filterFoodBankItems,
  generateNutritionalRecommendations,
} from "@/lib/food/nutritionCalculations";
import {
  foodBankReducer,
  initialFoodBankState,
  type FoodBankAction,
  type FoodBankUiState,
} from "@/reducers/foodBankReducer";
import type { FoodItem } from "@/types/food";
import type {
  MicronutrientStatus,
  NutrientDensity,
  NutritionalRecommendation,
} from "@/types/food";
import { useFoodBankData } from "@/hooks/useFoodBankData";

const GLYCEMIC_MODAL_MS = 5000;

export interface UseFoodBankPageResult {
  ui: FoodBankUiState;
  dispatch: Dispatch<FoodBankAction>;
  filteredFoodData: FoodItem[];
  nutrientDensity: NutrientDensity | null;
  micronutrientStatus: MicronutrientStatus | null;
  recommendations: NutritionalRecommendation[];
  foodData: ReturnType<typeof useFoodBankData>["foodData"];
  dataLoading: boolean;
  dataError: string | null;
  emailVerified: boolean;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFoodClick: (food: FoodItem) => void;
  handleClearFood: () => void;
  calculateGlycemicLoadAction: () => void;
  closeGlycemicModal: () => void;
}

export function useFoodBankPage(
  user: User | null | undefined,
  authLoading: boolean
): UseFoodBankPageResult {
  const { foodData, loading: dataLoading, error: dataError, emailVerified } =
    useFoodBankData(user, authLoading);

  const [ui, dispatch] = useReducer(foodBankReducer, initialFoodBankState);

  const modalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (modalTimer.current) {
        clearTimeout(modalTimer.current);
      }
    };
  }, []);

  const filteredFoodData = useMemo(
    () =>
      filterFoodBankItems(
        foodData,
        ui.searchTerm,
        ui.showWithGlycemicIndex
      ),
    [foodData, ui.searchTerm, ui.showWithGlycemicIndex]
  );

  const nutrientDensity = useMemo(
    () =>
      ui.selectedFood ? calculateNutrientDensity(ui.selectedFood) : null,
    [ui.selectedFood]
  );

  const micronutrientStatus = useMemo(
    () =>
      ui.selectedFood
        ? calculateMicronutrientStatus(ui.selectedFood)
        : null,
    [ui.selectedFood]
  );

  const recommendations = useMemo(
    () =>
      ui.selectedFood
        ? generateNutritionalRecommendations(ui.selectedFood)
        : [],
    [ui.selectedFood]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SEARCH", payload: e.target.value });
  }, []);

  const handleCheckboxChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "TOGGLE_GI_FILTER" });
    },
    []
  );

  const handleFoodClick = useCallback((food: FoodItem) => {
    dispatch({ type: "SELECT_FOOD", payload: food });
  }, []);

  const handleClearFood = useCallback(() => {
    dispatch({ type: "CLEAR_FOOD" });
  }, []);

  const closeGlycemicModal = useCallback(() => {
    if (modalTimer.current) {
      clearTimeout(modalTimer.current);
      modalTimer.current = null;
    }
    dispatch({ type: "CLOSE_GLYCEMIC_MODAL" });
  }, []);

  const calculateGlycemicLoadAction = useCallback(() => {
    const load = computeGlycemicLoad(ui.selectedFood, ui.portionSize);
    if (!load) return;

    dispatch({ type: "GLYCEMIC_CALCULATED", payload: load });

    if (modalTimer.current) {
      clearTimeout(modalTimer.current);
    }
    modalTimer.current = setTimeout(() => {
      dispatch({ type: "CLOSE_GLYCEMIC_MODAL" });
      modalTimer.current = null;
    }, GLYCEMIC_MODAL_MS);
  }, [ui.selectedFood, ui.portionSize]);

  return {
    ui,
    dispatch,
    filteredFoodData,
    nutrientDensity,
    micronutrientStatus,
    recommendations,
    foodData,
    dataLoading,
    dataError,
    emailVerified,
    handleSearch,
    handleCheckboxChange,
    handleFoodClick,
    handleClearFood,
    calculateGlycemicLoadAction,
    closeGlycemicModal,
  };
}
