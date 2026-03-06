/* eslint-disable react-hooks/set-state-in-effect */
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
import { flattenMK, matchTranscript } from '../utils/matching'
import { calculateStudyDuration } from '../utils/studyDuration'

export default function VersionOnePage() {
  const [curricula, setCurricula] = useState<Record<string, Curriculum>>({})
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [transcript, setTranscript] = useState<TranscriptCourse[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [manualSelections, setManualSelections] = useState<Record<number, number>>({})
  const [customSelections, setCustomSelections] = useState<Record<number, MataKuliah>>({})
  const [fileName, setFileName] = useState<string>('')
  const [studentName, setStudentName] = useState<string>('')
  const [asalKampus, setAsalKampus] = useState<string>('')
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
      return
    }
    setResults(matchTranscript(transcript, curr))
    setManualSelections({})
    setCustomSelections({})
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
    uploaderRef.current?.reset()
  }

  function handleFileParsed(result: ParseResult, name: string) {
    setTranscript(result.courses)
    setFileName(name)
    setStudentName(result.studentName ?? '')
    setAsalKampus(result.asalKampus ?? '')
    setManualSelections({})
    setCustomSelections({})
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
      <div className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 text-sm font-medium text-indigo-700">
        Versi 1: Evaluasi berbasis aturan (peta kompetensi + kemiripan + fuzzy)
      </div>

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

      {effectiveResults.length > 0 && (
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
      />
    </div>
  )
}
