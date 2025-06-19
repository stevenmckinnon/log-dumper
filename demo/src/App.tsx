import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { LoggerProvider, useLogger } from '@mckinnon/log-dumper'

const DemoContent = () => {
  const [count, setCount] = useState(0)
  const { logAction, logError, downloadLog } = useLogger()

  const handleClick = () => {
    logAction('Increment button clicked', { count })
    setCount((c) => c + 1)
  }

  const handleError = () => {
    try {
      throw new Error('Demo error!')
    } catch (e) {
      logError(e as Error, { count })
      alert('Error logged!')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + LoggerDumper</h1>
      <div className="card">
        <button onClick={handleClick}>
          count is {count}
        </button>
        <button onClick={handleError} style={{ marginLeft: 8 }}>
          Trigger Error
        </button>
        <button onClick={() => downloadLog()} style={{ marginLeft: 8 }}>
          Download Log
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

const App = () => (
  <LoggerProvider>
    <DemoContent />
  </LoggerProvider>
)

export default App
