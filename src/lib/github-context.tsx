import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { initializeGitHub, isGitHubConnected, fetchUserRepositories } from './github'
import { Repository } from './types'

interface GitHubContextType {
  isConnected: boolean
  token: string | null
  setToken: (token: string) => void
  disconnect: () => void
  repositories: Repository[]
  isLoading: boolean
  error: string | null
  refreshRepositories: () => Promise<void>
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined)

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [token, setTokenKV] = useKV<string | null>('github-token', null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentToken = token || null

  useEffect(() => {
    if (currentToken) {
      try {
        initializeGitHub(currentToken)
        refreshRepositories()
      } catch (err) {
        setError('Failed to initialize GitHub connection')
      }
    }
  }, [currentToken])

  const refreshRepositories = async () => {
    if (!currentToken) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const repos = await fetchUserRepositories()
      setRepositories(repos)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories')
      setRepositories([])
    } finally {
      setIsLoading(false)
    }
  }

  const setToken = (newToken: string) => {
    setTokenKV(newToken)
    initializeGitHub(newToken)
  }

  const disconnect = () => {
    setTokenKV(null)
    setRepositories([])
    setError(null)
  }

  return (
    <GitHubContext.Provider
      value={{
        isConnected: isGitHubConnected() && !!currentToken,
        token: currentToken,
        setToken,
        disconnect,
        repositories,
        isLoading,
        error,
        refreshRepositories
      }}
    >
      {children}
    </GitHubContext.Provider>
  )
}

export function useGitHub() {
  const context = useContext(GitHubContext)
  if (!context) {
    throw new Error('useGitHub must be used within GitHubProvider')
  }
  return context
}
