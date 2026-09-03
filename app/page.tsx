'use client'

import {
useEffect,
useRef,
useState,
type FormEvent,
type ReactNode,
} from 'react'
import {
ArrowRight,
LogOut,
ShieldCheck,
UserPlus,
} from 'lucide-react'

import { AshaHero } from '@/components/asha/asha-hero'
import { CheckIn } from '@/components/asha/check-in'
import { ExercisePlayer } from '@/components/asha/exercise-player'
import { ReportCard } from '@/components/asha/report-card'
import {
RedFlagDialog,
SosDialog,
} from '@/components/asha/safety-dialogs'
import { SettingsDialog } from '@/components/asha/settings-dialog'
import { TopNav } from '@/components/asha/top-nav'
import { Button } from '@/components/ui/button'

import {
signIn,
signUp,
signOut,
getCurrentUser,
onAuthStateChange,
type AuthUser,
} from '@/lib/auth'

/* =========================================================
ASHA APP SHELL
========================================================= */

function AshaAppShell({
onLogout,
isAdminMode,
currentUser,
}: {
onLogout: () => void
isAdminMode?: boolean
currentUser?: AuthUser
}) {
const [settingsOpen, setSettingsOpen] = useState(false)
const [sosOpen, setSosOpen] = useState(false)
const [redFlagOpen, setRedFlagOpen] = useState(false)

/*

* AshaHero registers its speech function here.
* Other components can then ask Asha to speak.
  */
  const sayRef = useRef<((text: string) => void) | null>(null)

const registerAshaSpeaker = (fn: (text: string) => void) => {
sayRef.current = fn
}

const onAshaSpeak = (text: string) => {
const cleanText = text.trim()

if (!cleanText) {
  return
}

if (sayRef.current) {
  sayRef.current(cleanText)
} else {
  console.warn('Asha speaker is not registered yet.')
}

}

return (
<>
<TopNav
onOpenSettings={() => setSettingsOpen(true)}
onOpenSos={() => setSosOpen(true)}
onLogout={onLogout}
isAdminMode={isAdminMode}
/>

  <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 overflow-x-hidden px-4 py-6 md:py-8">
    {/* =================================================
        ASHA VOICE / HERO
        ================================================= */}

    <AshaHero
      registerSay={registerAshaSpeaker}
      userName={currentUser?.name}
    />

    {/* =================================================
        CHECK-IN
        ================================================= */}

    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CheckIn
        onAshaSpeak={onAshaSpeak}
        onRedFlag={() => setRedFlagOpen(true)}
        onComplete={() => {
          window.setTimeout(() => {
            document
              .getElementById('routine')
              ?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
          }, 180)
        }}
      />

      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Kinetic Age
          </p>

          <h3 className="mt-3 text-2xl text-foreground">
            Smart support for daily movement
          </h3>

          <ul className="mt-4 space-y-3 text-base text-foreground">
            <li>
              • Gentle check-ins to match your energy and pain level
            </li>

            <li>
              • 2-minute seated mobility routines with guided pacing
            </li>

            <li>
              • Family and physio summaries via WhatsApp
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Care view
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="text-sm text-muted-foreground">
                Today&apos;s safety
              </p>

              <p className="mt-1 font-heading text-2xl font-extrabold text-foreground">
                Low risk
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/70 p-3">
              <p className="text-sm text-muted-foreground">
                Recovery focus
              </p>

              <p className="mt-1 font-heading text-2xl font-extrabold text-foreground">
                Mobility + comfort
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* =================================================
        EXERCISE
        ================================================= */}

    <ExercisePlayer onAshaSpeak={onAshaSpeak} />

    {/* =================================================
        REPORT
        ================================================= */}

    <ReportCard />
  </main>

  {/* ===================================================
      DIALOGS
      =================================================== */}

  <SettingsDialog
    open={settingsOpen}
    onOpenChange={setSettingsOpen}
    userName={currentUser?.name}
  />

  <SosDialog
    open={sosOpen}
    onOpenChange={setSosOpen}
  />

  <RedFlagDialog
    open={redFlagOpen}
    onOpenChange={setRedFlagOpen}
  />
</>

)
}

/* =========================================================
ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
onLogout,
onTestExperience,
}: {
onLogout: () => void
onTestExperience: () => void
}) {
const [users, setUsers] = useState<Record<string, unknown>[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
let cancelled = false

async function loadUsers() {
  try {
    const res = await fetch('/api/admin/users', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(
        'Failed to fetch users: ' + String(res.status)
      )
    }

    const data: unknown = await res.json()

    if (!cancelled) {
      if (Array.isArray(data)) {
        setUsers(
          data.filter(
            (item): item is Record<string, unknown> =>
              typeof item === 'object' &&
              item !== null
          )
        )
      } else {
        setUsers([])
      }
    }
  } catch (error) {
    console.error('Admin users fetch error:', error)

    if (!cancelled) {
      setUsers([])
    }
  } finally {
    if (!cancelled) {
      setLoading(false)
    }
  }
}

void loadUsers()

return () => {
  cancelled = true
}

}, [])

const handleManage = () => {
window.alert('Detailed view coming soon')
}

return ( <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-6 md:py-8"> <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between"> <div> <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
Admin access </p>

      <h1 className="mt-2 text-3xl text-foreground md:text-4xl">
        Bhanu Kumar Dev
      </h1>
    </div>

    <div className="flex gap-3">
      <Button
        type="button"
        onClick={onTestExperience}
        className="h-12 rounded-full px-5 text-base font-semibold"
      >
        Test User Experience
      </Button>

      <Button
        type="button"
        onClick={onLogout}
        variant="outline"
        className="h-12 rounded-full px-5 text-base font-semibold"
      >
        <LogOut className="size-4" aria-hidden />
        Logout
      </Button>
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    <StatCard
      title="Supabase Auth"
      value="Active"
      icon={<ShieldCheck className="size-5" aria-hidden />}
    />

    <StatCard
      title="Admin account"
      value="kumarbhanu818@gmail.com"
      icon={<UserPlus className="size-5" aria-hidden />}
    />
  </div>

  <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
    <div className="border-b border-border bg-secondary/70 px-5 py-4">
      <h2 className="text-2xl text-foreground">
        Registered Users
      </h2>
    </div>

    <div className="overflow-x-auto p-5">
      {loading ? (
        <p className="text-muted-foreground">
          Loading users...
        </p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">
          No registered users found.
        </p>
      ) : (
        <table className="w-full text-left text-sm md:text-base">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-bold">
                Email
              </th>

              <th className="px-5 py-3 font-bold">
                User ID
              </th>

              <th className="px-5 py-3 font-bold">
                Sign-up Date
              </th>

              <th className="px-5 py-3 font-bold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => {
              const userId =
                typeof user.id === 'string'
                  ? user.id
                  : ''

              const email =
                typeof user.email === 'string'
                  ? user.email
                  : ''

              const createdAt =
                typeof user.created_at === 'string'
                  ? user.created_at
                  : typeof user.createdAt === 'string'
                    ? user.createdAt
                    : ''

              const stableKey =
                userId ||
                email ||
                `user-${index}`

              return (
                <tr
                  key={stableKey}
                  className="border-t border-border"
                >
                  <td className="px-5 py-3 font-semibold text-foreground">
                    {email || 'No email'}
                  </td>

                  <td className="px-5 py-3 font-mono text-xs text-foreground">
                    {userId
                      ? userId.slice(0, 8) + '...'
                      : 'Unknown'}
                  </td>

                  <td className="px-5 py-3 text-foreground">
                    {createdAt
                      ? new Date(
                          createdAt
                        ).toLocaleDateString()
                      : 'Unknown'}
                  </td>

                  <td className="px-5 py-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleManage}
                      className="rounded-full text-xs"
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  </div>
</main>

)
}

/* =========================================================
STAT CARD
========================================================= */

function StatCard({
title,
value,
icon,
}: {
title: string
value: string
icon: ReactNode
}) {
return ( <div className="rounded-3xl border border-border bg-card p-5 shadow-sm"> <div className="flex items-center justify-between gap-3"> <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
{title} </p>

    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </span>
  </div>

  <p className="mt-5 font-heading text-2xl font-black text-foreground">
    {value}
  </p>
</div>

)
}

/* =========================================================
AUTH SCREEN
========================================================= */

function AuthScreen({
onLogin,
onRegister,
isLoading,
}: {
onLogin: (
email: string,
password: string
) => Promise<string | null>

onRegister: (
name: string,
email: string,
password: string
) => Promise<string | null>

isLoading: boolean
}) {
const [mode, setMode] =
useState<'login' | 'register'>('login')

const [loginEmail, setLoginEmail] = useState('')
const [loginPassword, setLoginPassword] = useState('')

const [registerName, setRegisterName] = useState('')
const [registerEmail, setRegisterEmail] = useState('')
const [registerPassword, setRegisterPassword] = useState('')

const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

const handleLogin = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault()

setLoading(true)
setError('')

try {
  const message = await onLogin(
    loginEmail.trim(),
    loginPassword
  )

  if (message) {
    setError(message)
  }
} catch (error) {
  console.error('Login error:', error)
  setError('Unable to login. Please try again.')
} finally {
  setLoading(false)
}

}

const handleRegister = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault()

setLoading(true)
setError('')

try {
  const message = await onRegister(
    registerName.trim(),
    registerEmail.trim(),
    registerPassword
  )

  if (message) {
    setError(message)
    return
  }

  setMode('login')
  setLoginEmail(registerEmail.trim())
  setLoginPassword('')
  setError('')
} catch (error) {
  console.error('Registration error:', error)
  setError(
    'Unable to create the account. Please try again.'
  )
} finally {
  setLoading(false)
}

}

if (isLoading) {
return ( <main className="flex min-h-screen items-center justify-center"> <p className="text-lg text-muted-foreground">
Loading... </p> </main>
)
}

return ( <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eaf7ee,_#f8fafc_55%)] px-4 py-10"> <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-border bg-card shadow-xl"> <div className="grid gap-0 md:grid-cols-2"> <div className="flex flex-col justify-between bg-gradient-to-br from-primary/10 via-secondary/80 to-teal/10 p-6 md:p-10"> <div> <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
Kinetic Age </p>

          <h1 className="mt-4 font-heading text-4xl font-black text-foreground md:text-5xl">
            Asha wellness access
          </h1>

          <p className="mt-4 text-lg text-foreground">
            Senior wellness companion for daily movement
            and care coordination
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-background/80 p-5 backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Features
          </p>

          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li>✓ Daily check-ins with health tracking</li>
            <li>✓ Guided mobility routines</li>
            <li>✓ Family &amp; physio summaries</li>
            <li>✓ Safety monitoring &amp; alerts</li>
          </ul>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="mb-6 inline-flex rounded-full border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={
              'rounded-full px-4 py-2 text-sm font-bold transition ' +
              (mode === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground')
            }
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={
              'rounded-full px-4 py-2 text-sm font-bold transition ' +
              (mode === 'register'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground')
            }
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Email
              </label>

              <input
                type="email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-base text-foreground"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Password
              </label>

              <input
                type="password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-base text-foreground"
                placeholder="Enter password"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}

              <ArrowRight
                className="size-4"
                aria-hidden
              />
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Full name
              </label>

              <input
                value={registerName}
                onChange={(event) =>
                  setRegisterName(event.target.value)
                }
                required
                autoComplete="name"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-base text-foreground"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Email
              </label>

              <input
                type="email"
                value={registerEmail}
                onChange={(event) =>
                  setRegisterEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-base text-foreground"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Password
              </label>

              <input
                type="password"
                value={registerPassword}
                onChange={(event) =>
                  setRegisterPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-base text-foreground"
                placeholder="Create password"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full rounded-full text-base font-bold"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  </div>
</main>

)
}

/* =========================================================
MAIN PAGE
========================================================= */

export default function Page() {
const [session, setSession] =
useState<AuthUser | null>(null)

const [ready, setReady] = useState(false)

const [showAdminTestMode, setShowAdminTestMode] =
useState(false)

useEffect(() => {
let mounted = true

const initializeAuth = async () => {
  try {
    const user = await getCurrentUser()

    if (!mounted) {
      return
    }

    setSession(user)
  } catch (error) {
    console.error(
      'Failed to load current user:',
      error
    )

    if (mounted) {
      setSession(null)
    }
  } finally {
    if (mounted) {
      setReady(true)
    }
  }
}

void initializeAuth()

/*
 * Keep this as unknown because different auth
 * implementations can return different subscription
 * shapes.
 */
const authListener: unknown =
  onAuthStateChange((user) => {
    if (mounted) {
      setSession(user)
    }
  })

/*
 * Clean up the listener safely.
 *
 * Supported forms:
 *
 * 1. () => void
 *
 * 2. { unsubscribe: () => void }
 *
 * 3. { data: { subscription: { unsubscribe: () => void } } }
 */
return () => {
  mounted = false

  if (typeof authListener === 'function') {
    ;(authListener as () => void)()
    return
  }

  if (
    authListener &&
    typeof authListener === 'object'
  ) {
    const listener =
      authListener as {
        unsubscribe?: unknown
        data?: unknown
      }

    if (
      typeof listener.unsubscribe ===
      'function'
    ) {
      ;(
        listener.unsubscribe as () => void
      )()
      return
    }

    if (
      listener.data &&
      typeof listener.data === 'object'
    ) {
      const data =
        listener.data as {
          subscription?: unknown
        }

      if (
        data.subscription &&
        typeof data.subscription ===
          'object'
      ) {
        const subscription =
          data.subscription as {
            unsubscribe?: unknown
          }

        if (
          typeof subscription.unsubscribe ===
          'function'
        ) {
          ;(
            subscription.unsubscribe as () =>
              void
          )()
        }
      }
    }
  }
}

}, [])

/* =======================================================
LOGIN
======================================================= */

const handleLogin = async (
email: string,
password: string
): Promise<string | null> => {
try {
const result = await signIn(
email.trim(),
password
)

  const user = result.user
  const error = result.error

  if (error) {
    return error
  }

  if (user) {
    setSession(user)
  }

  return null
} catch (error) {
  console.error('Sign-in error:', error)
  return 'Unable to login. Please try again.'
}

}

/* =======================================================
REGISTER
======================================================= */

const handleRegister = async (
name: string,
email: string,
password: string
): Promise<string | null> => {
try {
const result = await signUp(
name.trim(),
email.trim(),
password
)

  const user = result.user
  const error = result.error

  if (error) {
    return error
  }

  if (user) {
    setSession(user)
  }

  return null
} catch (error) {
  console.error('Sign-up error:', error)
  return 'Unable to create the account. Please try again.'
}

}

/* =======================================================
LOGOUT
======================================================= */

const handleLogout = async () => {
try {
await signOut()
} catch (error) {
console.error('Sign-out error:', error)
} finally {
setSession(null)
setShowAdminTestMode(false)
}
}

/* =======================================================
LOADING
======================================================= */

if (!ready) {
return ( <main className="flex min-h-screen w-full items-center justify-center"> <p className="text-lg text-muted-foreground">
Loading... </p> </main>
)
}

/* =======================================================
NOT LOGGED IN
======================================================= */

if (!session) {
return ( <AuthScreen
     onLogin={handleLogin}
     onRegister={handleRegister}
     isLoading={false}
   />
)
}

/* =======================================================
ADMIN
======================================================= */

if (
session.role === 'admin' &&
!showAdminTestMode
) {
return (
<AdminDashboard
onLogout={handleLogout}
onTestExperience={() =>
setShowAdminTestMode(true)
}
/>
)
}

/* =======================================================
USER EXPERIENCE
======================================================= */

return (
<AshaAppShell
onLogout={() => {
if (session.role === 'admin') {
setShowAdminTestMode(false)
} else {
void handleLogout()
}
}}
isAdminMode={session.role === 'admin'}
currentUser={session}
/>
)
}

