import React, { useState } from 'react'
import { authorize, confirmEmail, createUser } from '../utils/api'

function AccountModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSendCode() {
    setLoading(true)
    setMessage(null)
    try {
      await confirmEmail({ login: email }, undefined, false)
      setMessage('Код отправлен на почту')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmCodeAndCreate() {
    setLoading(true)
    setMessage(null)
    try {
      await confirmEmail({ login: email }, code, false)
      const { token } = await createUser(undefined, { login: email, password })
      if (token) {
        localStorage.setItem('authToken', token)
        setMessage('Регистрация успешна')
        onClose && onClose()
      } else {
        setMessage('Регистрация: не получен токен')
      }
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    setLoading(true)
    setMessage(null)
    try {
      const { token } = await authorize({ login: email, password })
      if (token) {
        localStorage.setItem('authToken', token)
        setMessage('Вход успешен')
        onClose && onClose()
      } else {
        setMessage('Вход: не получен токен')
      }
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account-modal-overlay active" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <div className="account-modal-icon">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="account-modal-title">Личный кабинет</div>
          <div className="account-modal-subtitle">Вход / регистрация</div>
        </div>

        <div className="account-modal-body">
          <div className="form-row">
            <label>Почта</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handleLogin} disabled={loading}>Войти</button>
            <button onClick={handleSendCode} disabled={loading}>Отправить код</button>
          </div>

          <hr />

          <div className="form-row">
            <label>Код из письма</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handleConfirmCodeAndCreate} disabled={loading}>Подтвердить и зарегистрировать</button>
          </div>

          {message && <div className="account-message">{message}</div>}
        </div>

        <div className="account-modal-footer">
          <button className="account-close-btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}

export default AccountModal