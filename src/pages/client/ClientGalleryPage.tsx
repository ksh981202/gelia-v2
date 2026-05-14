import { NailListExplore } from '../../widgets/nail-list/NailListExplore'
import { GALLERY_STYLE_TABS } from './galleryStyleTabs'

export default function ClientGalleryPage() {
  return (
    <NailListExplore
      tabs={GALLERY_STYLE_TABS}
      tabsSectionLabel="스타일"
      queryScope="gallery"
    />
  )
}
