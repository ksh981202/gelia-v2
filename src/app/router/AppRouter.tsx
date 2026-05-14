import AdminLayout from '../../widgets/layout/AdminLayout'
import ClientLayout from '../../widgets/layout/ClientLayout'
import AdminPage from '../../pages/admin/AdminPage'
import AdminUploadPage from '../../pages/admin/AdminUploadPage'
import ClientNailDetailPage from '../../pages/client/ClientNailDetailPage'
import ClientGalleryPage from '../../pages/client/ClientGalleryPage'
import ClientRankingPage from '../../pages/client/ClientRankingPage'
import ClientHomePage from '../../pages/client/ClientHomePage'
import ClientRecommendPage from '../../pages/client/ClientRecommendPage'
import ClientPage from '../../pages/client/ClientPage'
import QuizPage from '../../pages/quiz/QuizPage'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/client" replace /> },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientHomePage /> },
      { path: 'recommend', element: <ClientRecommendPage /> },
      { path: 'theme', element: <ClientPage /> },
      { path: 'detail/:nailId', element: <ClientNailDetailPage /> },
      { path: 'gallery', element: <ClientGalleryPage /> },
      { path: 'ranking', element: <ClientRankingPage /> },
      { path: 'quiz', element: <QuizPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminPage /> },
      { path: 'upload', element: <AdminUploadPage /> },
    ],
  },
  { path: '/quiz', element: <Navigate to="/client/quiz" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
