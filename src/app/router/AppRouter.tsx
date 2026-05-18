import AdminLayout from '../../widgets/layout/AdminLayout'
import ClientLayout from '../../widgets/layout/ClientLayout'
import AdminUploadPage from '../../pages/admin/AdminUploadPage'
import AdminBoard from '../../pages/admin/AdminBoard'
import AdminManagePage from '../../pages/admin/AdminManagePage'
import ClientNailDetailPage from '../../pages/client/ClientNailDetailPage'
import ClientGalleryExploreListPage from '../../pages/client/ClientGalleryExploreListPage'
import ClientGalleryPage from '../../pages/client/ClientGalleryPage'
import ClientRankingPage from '../../pages/client/ClientRankingPage'
import TrendPage from '../../pages/client/trend/TrendPage'
import TexturePage from '../../pages/client/trend/TexturePage'
import TextureListPage from '../../pages/client/trend/TextureListPage'
import SyrupBestListPage from '../../pages/client/trend/SyrupBestListPage'
import TextureGalleryListPage from '../../pages/client/trend/TextureGalleryListPage'
import PartsPage from '../../pages/client/trend/PartsPage'
import PartsListPage from '../../pages/client/trend/PartsListPage'
import StoneBestListPage from '../../pages/client/trend/StoneBestListPage'
import FullPartsListPage from '../../pages/client/trend/FullPartsListPage'
import PopularDesignPage from '../../pages/client/trend/PopularDesignPage'
import PeriodBestListPage from '../../pages/client/trend/PeriodBestListPage'
import ReactionBestListPage from '../../pages/client/trend/ReactionBestListPage'
import ShapeBestListPage from '../../pages/client/trend/ShapeBestListPage'
import SearchTrendListPage from '../../pages/client/trend/SearchTrendListPage'
import PatternPage from '../../pages/client/trend/PatternPage'
import PatternCurationPage from '../../pages/client/PatternCurationPage'
import MoodPage from '../../pages/client/trend/MoodPage'
import CategoryPage from '../../pages/client/CategoryPage'
import SearchMainPage from '../../pages/client/SearchMainPage'
import ClientLoginPage from '../../pages/client/ClientLoginPage'
import ClientAccountSettingsPage from '../../pages/client/ClientAccountSettingsPage'
import ClientNotificationSettingsPage from '../../pages/client/ClientNotificationSettingsPage'
import ClientMyPage from '../../pages/client/ClientMyPage'
import ClientMyNailListPage from '../../pages/client/ClientMyNailListPage'
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
import TestIntroPage from '../../pages/client/test/TestIntroPage'
import TestStep1Page from '../../pages/client/test/TestStep1Page'
import TestStep2Page from '../../pages/client/test/TestStep2Page'
import TestStep3Page from '../../pages/client/test/TestStep3Page'
import TestResultPage from '../../pages/client/test/TestResultPage'
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
      { path: 'category', element: <CategoryPage /> },
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
      { path: 'detail/:id', element: <ClientNailDetailPage /> },
      { path: 'gallery', element: <ClientGalleryPage /> },
      { path: 'search', element: <SearchMainPage /> },
      { path: 'login', element: <ClientLoginPage /> },
      { path: 'notifications', element: <ClientNotificationSettingsPage /> },
      { path: 'account', element: <ClientAccountSettingsPage /> },
      { path: 'my', element: <ClientMyPage /> },
      { path: 'my/list/:type', element: <ClientMyNailListPage /> },
      { path: 'ranking', element: <ClientRankingPage /> },
      { path: 'popular-design', element: <PopularDesignPage /> },
      { path: 'period-best-list', element: <PeriodBestListPage /> },
      { path: 'reaction-best-list', element: <ReactionBestListPage /> },
      { path: 'shape-best-list', element: <ShapeBestListPage /> },
      {
        path: 'search-trend-list',
        element: <SearchTrendListPage />,
      },
      { path: 'trend', element: <TrendPage /> },
      { path: 'texture', element: <TexturePage /> },
      {
        path: 'texture-list',
        element: <TextureListPage />,
      },
      { path: 'syrup-best', element: <SyrupBestListPage /> },
      { path: 'texture-gallery', element: <TextureGalleryListPage /> },
      { path: 'parts', element: <PartsPage /> },
      { path: 'parts-list', element: <PartsListPage /> },
      { path: 'stone-best-list', element: <StoneBestListPage /> },
      { path: 'full-parts-list', element: <FullPartsListPage /> },
      { path: 'art', element: <PatternCurationPage /> },
      { path: 'pattern', element: <PatternPage /> },
      { path: 'mood', element: <MoodPage /> },
      { path: 'test-intro', element: <TestIntroPage /> },
      { path: 'test-step1', element: <TestStep1Page /> },
      { path: 'test-step2', element: <TestStep2Page /> },
      { path: 'test-step3', element: <TestStep3Page /> },
      { path: 'test-result', element: <TestResultPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="upload" replace /> },
      { path: 'upload', element: <AdminUploadPage /> },
      { path: 'board', element: <AdminBoard /> },
      { path: 'manage', element: <AdminManagePage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
