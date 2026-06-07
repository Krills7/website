import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PageLoader from './components/PageLoader'

const FiberMapPage = lazy(() => import('./pages/FiberMapPage'))
const VisualPage = lazy(() => import('./pages/VisualPage'))

export default function App() {
  return (
    <BrowserRouter basename="/website">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="fiber-map"
            element={
              <Suspense fallback={<PageLoader />}>
                <FiberMapPage />
              </Suspense>
            }
          />
          <Route
            path="visual"
            element={
              <Suspense fallback={<PageLoader />}>
                <VisualPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
