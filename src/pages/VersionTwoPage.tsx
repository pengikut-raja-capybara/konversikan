import { useEffect, useRef, useState } from 'react'
import type {
  Curriculum,
  MataKuliah,
  MatchResult,
  ParseResult,
  TranscriptCourse,
} from '../types'
import ProdiSelector from '../components/ProdiSelector'
import FileUploader from '../components/FileUploader'
import SummaryCards from '../components/SummaryCards'
import ResultsTable from '../components/ResultsTable'
import { calculateStudyDuration } from '../utils/studyDuration'
import { flattenMK } from '../utils/matching'
import {
  isSemanticModelReady,
  matchTranscriptSemantic,
  type SemanticProgress,
} from '../utils/semanticMatching'

export default function VersionTwoPage() {
  const [curricula, setCurricula] = useState<Record<string, Curriculum>>({})
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [transcript, setTranscript] = useState<TranscriptCourse[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [manualSelections, setManualSelections] = useState<Record<number, number>>({})
  const [customSelections, setCustomSelections] = useState<Record<number, MataKuliah>>({})
  const [fileName, setFileName] = useState<string>('')
  const [studentName, setStudentName] = useState<string>('')
  const [asalKampus, setAsalKampus] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [semanticProgress, setSemanticProgress] = useState<SemanticProgress | null>(null)
  const [modelReady, setModelReady] = useState<boolean>(isSemanticModelReady())
  const uploaderRef = useRef<{ reset: () => void } | null>(null)

  useEffect(() => {
    const modules = import.meta.glob('../kurikulum/*.json', {
      eager: true,
    }) as Record<string, { default: Curriculum }>

    const loaded: Record<string, Curriculum> = {}
    for (const [path, mod] of Object.entries(modules)) {
      const name = path.split('/').pop()?.replace(/\.json$/, '') ?? path
      loaded[name] = mod.default
    }

    setCurricula(loaded)
    const keys = Object.keys(loaded)
    if (keys.length > 0) setSelectedKey(keys[0])
  }, [])

  useEffect(() => {
    const curr = curricula[selectedKey]
    if (!curr || transcript.length === 0) {
      setResults([])
      setManualSelections({})
      setCustomSelections({})
      setIsProcessing(false)
      setErrorMessage('')
      setSemanticProgress(null)
      return
    }

    let cancelled = false

    async function runSemanticMatch() {
      try {
        setIsProcessing(true)
        setErrorMessage('')
        setSemanticProgress({
          stage: 'loading_model',
          processed: 0,
          total: 1,
          percent: 0,
          message: 'Menyiapkan mesin semantik...',
        })

        const next = await matchTranscriptSemantic(transcript, curr, {
          onProgress: (progress) => {
            if (!cancelled) setSemanticProgress(progress)
            if (!cancelled && progress.stage === 'loading_model' && progress.percent >= 100) {
              setModelReady(true)
            }
          },
        })

        if (!cancelled) {
          setResults(next)
          setManualSelections({})
          setCustomSelections({})
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setResults([])
          setErrorMessage('Gagal memuat model semantik. Coba muat ulang halaman.')
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false)
          setTimeout(() => {
            setSemanticProgress((prev) => (prev?.stage === 'done' ? null : prev))
          }, 1200)
        }
      }
    }

    runSemanticMatch()

    return () => {
      cancelled = true
    }
  }, [transcript, selectedKey, curricula])

  function handleProdiChange(key: string) {
    setSelectedKey(key)
    setResults([])
    setTranscript([])
    setFileName('')
    setStudentName('')
    setAsalKampus('')
    setManualSelections({})
    setCustomSelections({})
    setIsProcessing(false)
    setErrorMessage('')
    setSemanticProgress(null)
    uploaderRef.current?.reset()
  }

  function handleFileParsed(result: ParseResult, name: string) {
    setTranscript(result.courses)
    setFileName(name)
    setStudentName(result.studentName ?? '')
    setAsalKampus(result.asalKampus ?? '')
    setManualSelections({})
    setCustomSelections({})
    setErrorMessage('')
    setSemanticProgress(null)
  }

  function handleRecommendationSelect(resultIndex: number, recommendationIndex: number) {
    setManualSelections((prev) => ({
      ...prev,
      [resultIndex]: recommendationIndex,
    }))
    setCustomSelections((prev) => {
      const next = { ...prev }
      delete next[resultIndex]
      return next
    })
  }

  function handleManualCourseSelect(resultIndex: number, course: MataKuliah) {
    setCustomSelections((prev) => ({
      ...prev,
      [resultIndex]: course,
    }))
    setManualSelections((prev) => {
      const next = { ...prev }
      delete next[resultIndex]
      return next
    })
  }

  function handleClearManualCourse(resultIndex: number) {
    setCustomSelections((prev) => {
      const next = { ...prev }
      delete next[resultIndex]
      return next
    })
  }

  function handleBulkSetUnmatched(indices: number[]) {
    setManualSelections((prev) => {
      const next = { ...prev }
      for (const idx of indices) next[idx] = -1
      return next
    })
    setCustomSelections((prev) => {
      const next = { ...prev }
      for (const idx of indices) delete next[idx]
      return next
    })
  }

  const effectiveResults = results.map((r, idx) => {
    const manualCourse = customSelections[idx]
    if (manualCourse) {
      return {
        ...r,
        match: manualCourse,
        score: 0,
        method: 'manual_custom',
      }
    }

    const selectedRecIdx = manualSelections[idx]
    if (selectedRecIdx === undefined) return r

    if (selectedRecIdx === -1) {
      return {
        ...r,
        match: undefined,
        score: 0,
        method: 'manual_unmatched',
      }
    }

    const selectedRec = r.recommendations?.[selectedRecIdx]
    if (!selectedRec) return r

    return {
      ...r,
      match: selectedRec.match,
      score: selectedRec.score,
      method: 'manual',
    }
  })

  const matchedCount = effectiveResults.filter((r) => r.match).length
  const unmatchedCount = effectiveResults.length - matchedCount
  const totalSKS = effectiveResults.reduce((sum, r) => sum + (r.match?.sks ?? 0), 0)
  const totalSKSWajib = curricula[selectedKey]?.total_sks_lulus ?? 144
  const allTargetCourses = curricula[selectedKey] ? flattenMK(curricula[selectedKey]) : []
  const { estSemesters, remainingSKS } = calculateStudyDuration(totalSKS, totalSKSWajib)

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="mb-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 text-sm font-medium text-emerald-700">
        Versi 2: Evaluasi AI semantik ({'Xenova/paraphrase-multilingual-MiniLM-L12-v2'})
      </div>

      {!modelReady && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-800">
          Info: Penggunaan pertama akan mengunduh model AI terlebih dahulu. Setelah selesai,
          proses berikutnya lebih cepat karena menggunakan cache lokal.
        </div>
      )}

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <ProdiSelector
          curricula={curricula}
          selectedKey={selectedKey}
          onChange={handleProdiChange}
        />
        <FileUploader
          onParsed={handleFileParsed}
          fileName={fileName}
          courseCount={transcript.length}
          studentName={studentName}
          asalKampus={asalKampus}
          resetRef={uploaderRef}
        />
      </div>

      {isProcessing && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p className="font-medium">
            {semanticProgress?.message || 'Sedang memproses pencocokan semantik, mohon tunggu...'}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${semanticProgress?.percent ?? 0}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-amber-700/90">
            <span>
              {semanticProgress?.percent ?? 0}%
            </span>
            <span>
              Tahap: {semanticProgress?.stage ?? '-'}
            </span>
            {semanticProgress?.cacheHits !== undefined && (
              <span>
                Cache ditemukan: {semanticProgress.cacheHits}
              </span>
            )}
            {semanticProgress?.cacheMisses !== undefined && (
              <span>
                Cache tidak ditemukan: {semanticProgress.cacheMisses}
              </span>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {effectiveResults.length > 0 && !isProcessing && (
        <SummaryCards
          matchedCount={matchedCount}
          unmatchedCount={unmatchedCount}
          totalSKS={totalSKS}
          estSemesters={estSemesters}
          remainingSKS={remainingSKS}
          totalSKSWajib={totalSKSWajib}
        />
      )}

      <ResultsTable
        results={effectiveResults}
        selectedRecommendations={manualSelections}
        customSelections={customSelections}
        availableCourses={allTargetCourses}
        onSelectRecommendation={handleRecommendationSelect}
        onSelectManualCourse={handleManualCourseSelect}
        onClearManualCourse={handleClearManualCourse}
        onBulkSetUnmatched={handleBulkSetUnmatched}
        originalTranscript={transcript}
        studentName={studentName}
        asalKampus={asalKampus}
      />
    </div>
  )
}
