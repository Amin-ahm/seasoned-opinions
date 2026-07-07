import { Link } from 'react-router-dom'
import { EmptyState } from '../components/bits'

export function NotFound() {
  return (
    <div className="container page">
      <EmptyState emoji="🍽️" title="Nothing on this plate">
        That page doesn't exist. <Link to="/">Head back to the spots</Link>.
      </EmptyState>
    </div>
  )
}
