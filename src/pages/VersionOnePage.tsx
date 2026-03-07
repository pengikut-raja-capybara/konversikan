/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import type {
  Curriculum,
  MataKuliah,
  MatchResult,
  TranscriptCourse,
} from '../types'
import ProdiSelector from '../components/ProdiSelector'
import FileUploader from '../components/FileUploader'
import SummaryCards from '../components/SummaryCards'
import ResultsTable from '../components/ResultsTable'
import { buildEffectiveResults } from '../utils/effectiveResults'
import { flattenMK, matchTranscript } from '../utils/matching'
import {
  applyParsedFile,
  bulkSetUnmatchedSelections,
  clearManualCourseSelection,
  resetUploaderAndSelections,
  setManualCourseSelection,
  setRecommendationSelection,
} from '../utils/selectionHandlers'
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

  const effectiveResults = buildEffectiveResults(results, manualSelections, customSelections)

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
          onChange={(key) => resetUploaderAndSelections(
            setSelectedKey,
            key,
            setResults,
            setTranscript,
            setFileName,
            setStudentName,
            setAsalKampus,
            setManualSelections,
            setCustomSelections,
            uploaderRef,
          )}
        />
        <FileUploader
          onParsed={(parsed, name) => applyParsedFile(
            parsed,
            name,
            setTranscript,
            setFileName,
            setStudentName,
            setAsalKampus,
            setManualSelections,
            setCustomSelections,
          )}
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
        onSelectRecommendation={(resultIndex, recommendationIndex) => setRecommendationSelection(
          resultIndex,
          recommendationIndex,
          setManualSelections,
          setCustomSelections,
        )}
        onSelectManualCourse={(resultIndex, course) => setManualCourseSelection(
          resultIndex,
          course,
          setManualSelections,
          setCustomSelections,
        )}
        onClearManualCourse={(resultIndex) => clearManualCourseSelection(resultIndex, setCustomSelections)}
        onBulkSetUnmatched={(indices) => bulkSetUnmatchedSelections(indices, setManualSelections, setCustomSelections)}
        originalTranscript={transcript}
        studentName={studentName}
        asalKampus={asalKampus}
      />
    </div>
  )
}
