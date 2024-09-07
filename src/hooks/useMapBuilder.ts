import React, { createContext, useContext } from "react";
import { type MapBuilderState, ReducerActions } from "@/lib/mapBuilderReducer";
import { Maybe } from "@/lib/maybe";

export interface MapBuilderProviderState extends MapBuilderState {
  dispatch: React.Dispatch<ReducerActions>;
  saveToFile: () => void;
  loadFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MapBuilderContext = createContext<Maybe<MapBuilderProviderState>>(
  Maybe.None,
);

export function useMapBuilder() {
  const context = useContext(MapBuilderContext);
  if (Maybe.isNone(context)) {
    throw new Error("useMapBuilder must be used within a MapBuilderProvider");
  }
  return context;
}
