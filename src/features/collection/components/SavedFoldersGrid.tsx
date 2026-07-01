import {
  DEFAULT_COLLECTION_FOLDER_ID,
  useClientFolderCoverMapQuery,
  useClientFoldersQuery,
  useDefaultSaveCoverQuery,
} from '@/features/collection/api/useClientFolderApi'
import { Folder } from 'lucide-react'
import { Link } from 'react-router-dom'

type SavedFoldersGridProps = {
  userId: string | null
  isEnglish: boolean
  gridClassName?: string
}

const DEFAULT_GRID_CLASS = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5'

function FolderAlbumCard({
  title,
  coverUrl,
  fallbackEmoji,
  isEnglish,
  to,
}: {
  title: string
  coverUrl: string | null | undefined
  fallbackEmoji?: string
  isEnglish: boolean
  to: string
}) {
  return (
    <Link
      to={to}
      className="group flex w-full flex-col text-left"
      aria-label={isEnglish ? `Open folder ${title}` : `${title} 폴더 열기`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-indigo-50 via-white to-rose-50 shadow-sm transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
            {fallbackEmoji ? (
              <span className="text-4xl" aria-hidden>
                {fallbackEmoji}
              </span>
            ) : (
              <Folder className="h-10 w-10" strokeWidth={1.5} aria-hidden />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-3 pb-3 pt-10">
          <span className="line-clamp-2 text-sm font-bold leading-snug text-white">{title}</span>
        </div>
      </div>
    </Link>
  )
}

export default function SavedFoldersGrid({
  userId,
  isEnglish,
  gridClassName = DEFAULT_GRID_CLASS,
}: SavedFoldersGridProps) {
  const { data: folders = [], isLoading, isError } = useClientFoldersQuery(userId)
  const folderIds = folders.map((folder) => folder.id)
  const { data: coverMap = {} } = useClientFolderCoverMapQuery(userId, folderIds)
  const { data: defaultCover } = useDefaultSaveCoverQuery(userId)

  const defaultTitle = isEnglish ? 'Default Saves' : '기본 저장'

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={`saved-folder-skel-${index}`}
            className="aspect-square animate-pulse rounded-2xl border border-black/5 bg-gray-100"
            aria-hidden
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="col-span-full py-12 text-center text-sm text-stone-500">
        {isEnglish ? 'Failed to load folders.' : '폴더를 불러오지 못했어요.'}
      </p>
    )
  }

  return (
    <div className={gridClassName}>
      <FolderAlbumCard
        title={defaultTitle}
        coverUrl={defaultCover}
        fallbackEmoji="📂"
        isEnglish={isEnglish}
        to={`/collection/${DEFAULT_COLLECTION_FOLDER_ID}`}
      />

      {folders.map((folder) => (
        <FolderAlbumCard
          key={folder.id}
          title={folder.name}
          coverUrl={coverMap[folder.id]}
          isEnglish={isEnglish}
          to={`/collection/${folder.id}`}
        />
      ))}
    </div>
  )
}
