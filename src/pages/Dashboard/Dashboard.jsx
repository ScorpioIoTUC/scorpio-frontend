import { useEffect, useMemo, useState } from 'react'
import {
  createStation,
  deleteStation,
  getStations,
  regenerateStationKey,
} from '../../services/stationService'
import { clearSession, getCurrentUserId, getToken } from '../../services/sessionService'
import { deleteUser, getUserById, updateUser } from '../../services/userService'
import './Dashboard.css'

const initialStationForm = {
  name: '',
  latitude: '',
  longitude: '',
  altitude: '',
}

const initialSettingsForm = {
  name: '',
  email: '',
  password: '',
}

function isOnline(station) {
  return station?.status === true || station?.status === 'online'
}

function stationIdentifier(station) {
  return station?.uuid || station?.id
}

function buildStationKey(response) {
  const stationId = response?.stationUuid
  const ownerKey = response?.ownerKey

  if (response?.stationKey) return response.stationKey
  if (stationId && ownerKey) return `${stationId}.${ownerKey}`
  return ownerKey || ''
}

function formatCoordinate(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(5) : 'N/A'
}

export default function Dashboard() {
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [stationForm, setStationForm] = useState(initialStationForm)
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm)
  const [user, setUser] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [accountDeleteConfirmation, setAccountDeleteConfirmation] = useState('')
  const [keyModal, setKeyModal] = useState({ isOpen: false, title: '', stationKey: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingStation, setIsSavingStation] = useState(false)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const userId = useMemo(() => getCurrentUserId(), [])
  const userStations = useMemo(() => {
    if (!userId) return stations

    const ownedStations = stations.filter((station) => !station.ownerId || Number(station.ownerId) === Number(userId))
    return ownedStations
  }, [stations, userId])

  useEffect(() => {
    if (!getToken()) {
      window.location.assign('/login')
      return
    }

    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const [stationData, userData] = await Promise.all([
          getStations(),
          userId ? getUserById(userId) : Promise.resolve(null),
        ])

        if (!isMounted) return

        setStations(stationData)
        setUser(userData)
        setSettingsForm({
          name: userData?.name || '',
          email: userData?.email || '',
          password: '',
        })
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [userId])

  function handleStationFormChange(event) {
    const { name, value } = event.target
    setStationForm((current) => ({ ...current, [name]: value }))
  }

  function handleSettingsChange(event) {
    const { name, value } = event.target
    setSettingsForm((current) => ({ ...current, [name]: value }))
  }

  async function refreshStations(nextSelectedId) {
    const stationData = await getStations()
    setStations(stationData)

    if (nextSelectedId) {
      setSelectedStation(stationData.find((station) => String(stationIdentifier(station)) === String(nextSelectedId)) || null)
    }
  }

  async function handleCreateStation(event) {
    event.preventDefault()
    setIsSavingStation(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: stationForm.name.trim(),
        latitude: Number(stationForm.latitude),
        longitude: Number(stationForm.longitude),
        altitude: Number(stationForm.altitude),
      }

      if (userId) {
        payload.ownerId = Number(userId)
      }

      if (!payload.name || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude) || !Number.isFinite(payload.altitude)) {
        throw new Error('Nombre, latitud, longitud y altitud son obligatorios.')
      }

      const response = await createStation(payload)
      const stationKey = buildStationKey(response)
      setStationForm(initialStationForm)
      await refreshStations(response?.uuid || response?.id || response?.station?.uuid || response?.station?.id)
      setKeyModal({
        isOpen: Boolean(stationKey),
        title: 'Llave de nueva estacion',
        stationKey,
      })
      setMessage('Estacion creada correctamente.')
    } catch (createError) {
      setError(createError.message)
    } finally {
      setIsSavingStation(false)
    }
  }

  async function handleRegenerateKey() {
    if (!selectedStation) return

    setError('')
    setMessage('')

    try {
      const response = await regenerateStationKey(stationIdentifier(selectedStation))
      const stationKey = buildStationKey({ ...response, stationId: stationIdentifier(selectedStation) })

      if (!stationKey) {
        throw new Error('La API no retorno una llave valida.')
      }

      setKeyModal({
        isOpen: true,
        title: `Nueva llave para ${selectedStation.name}`,
        stationKey,
      })
      setMessage('Llave regenerada correctamente.')
    } catch (regenerateError) {
      setError(regenerateError.message)
    }
  }

  async function handleDeleteStation() {
    if (!selectedStation || deleteConfirmation !== selectedStation.name) return

    setError('')
    setMessage('')

    try {
      await deleteStation(stationIdentifier(selectedStation))
      setSelectedStation(null)
      setDeleteConfirmation('')
      await refreshStations()
      setMessage('Estacion eliminada correctamente.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleUpdateUser(event) {
    event.preventDefault()
    if (!userId) return

    setIsSavingUser(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        name: settingsForm.name.trim(),
        email: settingsForm.email.trim(),
      }

      if (settingsForm.password) {
        payload.password = settingsForm.password
      }

      const updatedUser = await updateUser(userId, payload)
      setUser(updatedUser)
      setSettingsForm((current) => ({ ...current, password: '' }))
      setMessage('Configuracion actualizada.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setIsSavingUser(false)
    }
  }

  async function handleDeleteAccount() {
    if (!userId || accountDeleteConfirmation !== settingsForm.email) return

    setError('')
    setMessage('')

    try {
      await deleteUser(userId)
      clearSession()
      window.location.assign('/login')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function copyStationKey() {
    await navigator.clipboard.writeText(keyModal.stationKey)
    setMessage('Llave copiada al portapapeles.')
  }

  function logout() {
    clearSession()
    window.location.assign('/login')
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <a href="/" className="dashboard-brand">
          SCORPIO
        </a>
        <div>
          <p>{user?.name || 'Operador'}</p>
          <button type="button" onClick={logout}>Salir</button>
        </div>
      </header>

      <section className="dashboard-shell">
        <aside className="dashboard-panel dashboard-panel--stations">
          <div className="dashboard-panel__header">
            <div>
              <p>Ground stations</p>
              <h1>Mis estaciones</h1>
            </div>
            <span>{userStations.length}</span>
          </div>

          {isLoading ? (
            <p className="dashboard-state">Cargando estaciones...</p>
          ) : (
            <div className="station-list">
              {userStations.map((station) => (
                <button
                  key={stationIdentifier(station)}
                  type="button"
                  className={`station-list__item ${stationIdentifier(selectedStation) === stationIdentifier(station) ? 'station-list__item--active' : ''
                    }`}
                  onClick={() => {
                    setSelectedStation(station)
                    setDeleteConfirmation('')
                  }}
                >
                  <span className={isOnline(station) ? 'station-list__dot station-list__dot--online' : 'station-list__dot'} />
                  <strong>{station.name}</strong>
                  <small>{formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}</small>
                </button>
              ))}
              {!userStations.length && <p className="dashboard-state">Aun no tienes estaciones registradas.</p>}
            </div>
          )}
        </aside>

        <section className="dashboard-panel dashboard-panel--detail">
          <div className="dashboard-panel__header">
            <div>
              <p>Station detail</p>
              <h2>{selectedStation?.name || 'Selecciona una estacion'}</h2>
            </div>
          </div>

          {selectedStation ? (
            <>
              <dl className="station-detail-grid">
                <div>
                  <dt>Status</dt>
                  <dd className={isOnline(selectedStation) ? 'dashboard-success' : 'dashboard-danger'}>
                    {isOnline(selectedStation) ? 'Online' : 'Offline'}
                  </dd>
                </div>
                <div>
                  <dt>Latitude</dt>
                  <dd>{formatCoordinate(selectedStation.latitude)}</dd>
                </div>
                <div>
                  <dt>Longitude</dt>
                  <dd>{formatCoordinate(selectedStation.longitude)}</dd>
                </div>
                <div>
                  <dt>Altitude</dt>
                  <dd>{Number(selectedStation.altitude || 0).toLocaleString()} m</dd>
                </div>
              </dl>

              <div className="dashboard-actions">
                <button type="button" onClick={handleRegenerateKey}>Regenerar llave</button>
              </div>

              <div className="danger-zone">
                <h3>Eliminar estacion</h3>
                <p>Escribe <strong>{selectedStation.name}</strong> para confirmar.</p>
                <input
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder="Nombre de la estacion"
                />
                <button type="button" disabled={deleteConfirmation !== selectedStation.name} onClick={handleDeleteStation}>
                  Eliminar
                </button>
              </div>
            </>
          ) : (
            <p className="dashboard-state">Haz click en una estacion para ver mas detalle y acciones.</p>
          )}
        </section>

        <aside className="dashboard-panel dashboard-panel--create">
          <div className="dashboard-panel__header">
            <div>
              <p>Create station</p>
              <h2>Nueva estacion</h2>
            </div>
          </div>

          <form className="dashboard-form" onSubmit={handleCreateStation}>
            <label>
              Nombre
              <input name="name" value={stationForm.name} onChange={handleStationFormChange} required />
            </label>
            <label>
              Latitude
              <input name="latitude" type="number" step="any" value={stationForm.latitude} onChange={handleStationFormChange} required />
            </label>
            <label>
              Longitude
              <input name="longitude" type="number" step="any" value={stationForm.longitude} onChange={handleStationFormChange} required />
            </label>
            <label>
              Altitude
              <input name="altitude" type="number" step="any" value={stationForm.altitude} onChange={handleStationFormChange} required />
            </label>
            <button type="submit" disabled={isSavingStation}>{isSavingStation ? 'Creando...' : 'Crear estacion'}</button>
          </form>
        </aside>

        <section className="dashboard-panel dashboard-panel--settings">
          <div className="dashboard-panel__header">
            <div>
              <p>User settings</p>
              <h2>Configuracion</h2>
            </div>
          </div>

          <form className="dashboard-form" onSubmit={handleUpdateUser}>
            <label>
              Nombre
              <input name="name" value={settingsForm.name} onChange={handleSettingsChange} />
            </label>
            <label>
              Email
              <input name="email" type="email" value={settingsForm.email} onChange={handleSettingsChange} />
            </label>
            <label>
              Nueva password
              <input name="password" type="password" value={settingsForm.password} onChange={handleSettingsChange} placeholder="Opcional" />
            </label>
            <button type="submit" disabled={isSavingUser}>{isSavingUser ? 'Guardando...' : 'Guardar cambios'}</button>
          </form>

          <div className="danger-zone">
            <h3>Eliminar cuenta</h3>
            <p>Escribe tu email para confirmar.</p>
            <input
              value={accountDeleteConfirmation}
              onChange={(event) => setAccountDeleteConfirmation(event.target.value)}
              placeholder={settingsForm.email || 'email'}
            />
            <button type="button" disabled={accountDeleteConfirmation !== settingsForm.email} onClick={handleDeleteAccount}>
              Eliminar cuenta
            </button>
          </div>
        </section>
      </section>

      {(message || error) && (
        <div className={`dashboard-toast ${error ? 'dashboard-toast--error' : ''}`} role="status">
          {error || message}
        </div>
      )}

      {keyModal.isOpen && (
        <div className="key-modal" role="dialog" aria-modal="true" aria-labelledby="station-key-title">
          <div className="key-modal__content">
            <p>Llave de autenticacion</p>
            {/* <h2 id="station-key-title">{keyModal.title}</h2> */}
            <code>{keyModal.stationKey}</code>
            <p>
              Esta llave se muestra una sola vez. Guardala en un lugar seguro para que tu estacion pueda autenticarse y
              enviar paquetes a SCORPIO.
            </p>
            <div className="key-modal__actions">
              <button type="button" onClick={copyStationKey}>Copiar llave</button>
              <button type="button" onClick={() => setKeyModal({ isOpen: false, title: '', stationKey: '' })}>
                Ya la guarde
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
