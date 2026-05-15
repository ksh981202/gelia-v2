import AdminLayout from '../../widgets/layout/AdminLayout'
import ClientLayout from '../../widgets/layout/ClientLayout'
import AdminPage from '../../pages/admin/AdminPage'
import AdminUploadPage from '../../pages/admin/AdminUploadPage'
import ClientNailDetailPage from '../../pages/client/ClientNailDetailPage'
import ClientGalleryExploreListPage from '../../pages/client/ClientGalleryExploreListPage'
import ClientGalleryPage from '../../pages/client/ClientGalleryPage'
import ClientRankingPage from '../../pages/client/ClientRankingPage'
import ClientHomePage from '../../pages/client/ClientHomePage'
import ClientRecommendPage from '../../pages/client/ClientRecommendPage'
import ClientPage from '../../pages/client/ClientPage'
import ClientSituationListPage from '../../pages/client/ClientSituationListPage'
import ClientStyleBestListPage from '../../pages/client/ClientStyleBestListPage'
import ClientStyleCurationPage from '../../pages/client/ClientStyleCurationPage'
import ClientStyleGalleryListPage from '../../pages/client/ClientStyleGalleryListPage'
import ClientStyleListPage from '../../pages/client/ClientStyleListPage'
import ClientThemeListPage from '../../pages/client/ClientThemeListPage'
import ClientSeasonCurationPage from '../../pages/client/ClientSeasonCurationPage'
import ClientSeasonListPage from '../../pages/client/ClientSeasonListPage'
import ClientVacationListPage from '../../pages/client/ClientVacationListPage'
import ClientSeasonPopularListPage from '../../pages/client/ClientSeasonPopularListPage'
import ClientColorCurationPage from '../../pages/client/ClientColorCurationPage'
import ClientColorListPage from '../../pages/client/ClientColorListPage'
import ClientColorThemeListPage from '../../pages/client/ClientColorThemeListPage'
import ClientColorPopularListPage from '../../pages/client/ClientColorPopularListPage'
import ClientTodaySpecialPage from '../../pages/client/ClientTodaySpecialPage'
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
      { path: 'color-curation', element: <ClientColorCurationPage /> },
      { path: 'color-list', element: <ClientColorListPage /> },
      { path: 'color-theme-list', element: <ClientColorThemeListPage /> },
      { path: 'color-popular-list', element: <ClientColorPopularListPage /> },
      { path: 'today-special', element: <ClientTodaySpecialPage /> },
      { path: 'theme', element: <ClientPage /> },
      { path: 'style-curation', element: <ClientStyleCurationPage /> },
      { path: 'style-list', element: <ClientStyleListPage /> },
      { path: 'style-best-list', element: <ClientStyleBestListPage /> },
      { path: 'style-gallery-list', element: <ClientStyleGalleryListPage /> },
      { path: 'theme-list', element: <ClientThemeListPage /> },
      { path: 'situation-list', element: <ClientSituationListPage /> },
      { path: 'season-curation', element: <ClientSeasonCurationPage /> },
      { path: 'season-list', element: <ClientSeasonListPage /> },
      { path: 'vacation-list', element: <ClientVacationListPage /> },
      {
        path: 'season-popular-list',
        element: <ClientSeasonPopularListPage />,
      },
      {
        path: 'gallery-explore-list',
        element: <ClientGalleryExploreListPage />,
      },
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
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
