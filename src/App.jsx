import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const FiberMapPage = lazy(() => import('./pages/FiberMapPage'))
const VisualPage = lazy(() => import('./pages/VisualPage'))
const PostBoardPage = lazy(() => import('./pages/PostBoardPage'))

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        fontSize: '12px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
      }}
    >
      loading module…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/website">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="profile"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="work"
            element={
              <Suspense fallback={<RouteFallback />}>
                <WorkPage />
              </Suspense>
            }
          />
          <Route
            path="fiber-map"
            element={
              <Suspense fallback={<RouteFallback />}>
                <FiberMapPage />
              </Suspense>
            }
          />
          <Route
            path="visual"
            element={
              <Suspense fallback={<RouteFallback />}>
                <VisualPage />
              </Suspense>
            }
          />
          <Route
            path="postboard"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PostBoardPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
