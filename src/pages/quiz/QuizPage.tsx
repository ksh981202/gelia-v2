import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QUIZ_QUESTIONS,
  QUIZ_TOTAL_STEPS,
  resolveQuizGalleryTab,
} from '../../features/quiz-logic/quizData'
import { useQuizStore } from '../../features/quiz-logic/useQuizStore'
import { PageContainer } from '../../shared/ui/PageContainer'

export default function QuizPage() {
  const navigate = useNavigate()
  const answers = useQuizStore((s) => s.answers)
  const currentStep = useQuizStore((s) => s.currentStep)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const nextStep = useQuizStore((s) => s.nextStep)
  const prevStep = useQuizStore((s) => s.prevStep)
  const resetQuiz = useQuizStore((s) => s.resetQuiz)

  const isComplete = currentStep >= QUIZ_TOTAL_STEPS
  const activeQuestion = !isComplete ? QUIZ_QUESTIONS[currentStep] : undefined

  const progressRatio = useMemo(() => {
    if (isComplete) return 1
    return (currentStep + 1) / QUIZ_TOTAL_STEPS
  }, [currentStep, isComplete])

  const resultTab = useMemo(
    () => (isComplete ? resolveQuizGalleryTab(answers) : null),
    [answers, isComplete],
  )

  const onPickOption = useCallback(
    (step: number, value: string) => {
      setAnswer(step, value)
      nextStep()
    },
    [nextStep, setAnswer],
  )

  const onViewResult = useCallback(() => {
    if (!resultTab) return
    const params = new URLSearchParams()
    params.set('tab', resultTab)
    resetQuiz()
    navigate({ pathname: '/client/gallery', search: params.toString() })
  }, [navigate, resetQuiz, resultTab])

  const canGoBack = currentStep > 0 || isComplete

  return (
    <PageContainer>
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          젤리아 네일 진단
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          취향에 맞는 스타일별 갤러리 탭을 추천해 드려요.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={!canGoBack}
            className="shrink-0 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            뒤로 가기
          </button>
          <div
            className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            role="progressbar"
            aria-valuenow={Math.round(progressRatio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="퀴즈 진행률"
          >
            <div
              className="h-full rounded-full bg-violet-600 transition-[width] duration-300 ease-out"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
          <span className="shrink-0 tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
            {isComplete ? QUIZ_TOTAL_STEPS : currentStep + 1} / {QUIZ_TOTAL_STEPS}
          </span>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          {isComplete && resultTab ? (
            <div className="text-center">
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                추천 스타일
              </p>
              <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {resultTab}
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                갤러리에서 바로 이 탭으로 이동할 수 있어요.
              </p>
              <button
                type="button"
                onClick={onViewResult}
                className="mt-6 w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                결과 보기
              </button>
            </div>
          ) : activeQuestion ? (
            <>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {activeQuestion.prompt}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {activeQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onPickOption(currentStep, opt.value)}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-sm font-medium text-neutral-900 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-violet-600 dark:hover:bg-violet-950/40"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
