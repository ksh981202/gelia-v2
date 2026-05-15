import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuizState {
  currentStep: number;
  answers: Record<number, string>;
  nextStep: () => void;
  prevStep: () => void;
  resetQuiz: () => void;
  setAnswer: (step: number, answer: string) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0, // 0: 인트로, 1: 손톱 길이/타입, 2: 무드, 3: 컬러, 4: 결과
      answers: {},
      
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      resetQuiz: () => set({ currentStep: 0, answers: {} }),
      
      setAnswer: (step, answer) => set((state) => ({
        answers: { ...state.answers, [step]: answer }
      })),
    }),
    {
      name: 'gelia-quiz', // 로컬 스토리지에 저장되어 새로고침해도 안 날아감
      partialize: (state) => ({ currentStep: state.currentStep, answers: state.answers }),
    }
  )
);
