import { Link } from 'react-router-dom'

type GeliaWordmarkProps = {
  className?: string
  to?: string
  onClick?: () => void
}

export default function GeliaWordmark({ className = '', to = '/', onClick }: GeliaWordmarkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        'block w-fit shrink-0 whitespace-nowrap text-[28px] font-bold tracking-wide text-gray-900 transition-opacity hover:opacity-80 sm:text-[30px]',
        className,
      ].join(' ')}
      style={{ fontFamily: "'Playfair Display', serif" }}
      aria-label="GELIA 홈"
    >
      GELIA
    </Link>
  )
}
