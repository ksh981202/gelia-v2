import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QuizAnswers = Record<number, string>

type QuizState = {
  answers: QuizAnswers
  currentStep: number
  setAnswer: (step: number, answer: string) => void
  nextStep: () => void
  prevStep: () => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      answers: {},
      currentStep: 0,
      setAnswer: (step, answer) =>
        set((s) => ({
          answers: { ...s.answers, [step]: answer },
        })),
      nextStep: () =>
        set((s) => ({
          currentStep: s.currentStep + 1,
        })),
      prevStep: () =>
        set((s) => ({
          currentStep: Math.max(0, s.currentStep - 1),
        })),
      resetQuiz: () =>
        set({
          answers: {},
          currentStep: 0,
        }),
    }),
    {
      name: 'gelia-quiz',
      partialize: (s) => ({
        answers: s.answers,
        currentStep: s.currentStep,
      }),
    },
  ),
)
