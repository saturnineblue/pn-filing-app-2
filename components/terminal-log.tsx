'use client'

import { useEffect, useRef } from 'react'

export interface LogEntry {
  timestamp: Date
  level: 'info' | 'success' | 'error' | 'warning'
  message: string
}

interface TerminalLogProps {
  logs: LogEntry[]
  isActive: boolean
}

export default function TerminalLog({ logs, isActive }: TerminalLogProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      default:
        return 'text-gray-300'
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (!isActive && logs.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          CustomsCity API Status
        </h3>
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        )}
      </div>
      
      <div 
        ref={terminalRef}
        className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-y-auto max-h-96"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">
            Waiting for API submission...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>
              {' '}
              <span className={getLogColor(log.level)}>
                {log.level === 'success' && '✓ '}
                {log.level === 'error' && '✗ '}
                {log.level === 'warning' && '⚠ '}
                {log.message}
              </span>
            </div>
          ))
        )}
        {isActive && (
          <div className="mt-2 text-gray-500">
            <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-1"></span>
          </div>
        )}
      </div>
    </div>
  )
}
