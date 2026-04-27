import { useEffect } from 'react'
import { AppShell } from '@/components/Layout/AppShell'

function App(): React.JSX.Element {
  useEffect(() => {
    if (window.api?.ping) {
      window.api.ping().then((result) => {
        console.log('IPC ping result:', result)
      })
    }
  }, [])

  return <AppShell />
}

export default App
