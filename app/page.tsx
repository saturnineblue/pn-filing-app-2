'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import CSVUploadForm from '@/components/csv-upload-form'
import ManualEntryForm from '@/components/manual-entry-form'
import TerminalLog, { LogEntry } from '@/components/terminal-log'

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isActive, setIsActive] = useState(false)

  const addLog = (level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), level, message }])
  }

  const clearLogs = () => {
    setLogs([])
    setIsActive(false)
  }

  const startLogging = () => {
    setIsActive(true)
    clearLogs()
  }

  const stopLogging = () => {
    setIsActive(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Standart PN Notice Filer
          </h1>
          
          <div className="space-y-8">
            <CSVUploadForm 
              addLog={addLog}
              startLogging={startLogging}
              stopLogging={stopLogging}
            />
            <ManualEntryForm 
              addLog={addLog}
              startLogging={startLogging}
              stopLogging={stopLogging}
            />
          </div>

          <TerminalLog logs={logs} isActive={isActive} />
        </div>
      </main>
    </div>
  )
}
