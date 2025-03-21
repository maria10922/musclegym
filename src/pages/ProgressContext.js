// ProgressContext.js
import React, { createContext, useContext, useState } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [completedExercises, setCompletedExercises] = useState(0);
  const totalExercises = 10; // Cambia esto según tu lógica

  const incrementProgress = () => {
    setCompletedExercises(prev => Math.min(prev + 1, totalExercises));
  };

  return (
    <ProgressContext.Provider value={{ completedExercises, totalExercises, incrementProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  return useContext(ProgressContext);
};