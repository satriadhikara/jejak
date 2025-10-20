import { createContext, useContext, ReactNode, useState } from 'react';

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  address: string;
  mainText: string;
}

const LocationContext = createContext<{
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
} | null>(null);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return context;
};
