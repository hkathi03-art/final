import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg:'', type:'info', show:false })

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, show:true })
    setTimeout(() => setToast(t => ({ ...t, show:false })), 3500)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast" className={toast.show ? `show ${toast.type}` : ''}>
        {toast.msg}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
