// Live list of all spots, shared across the home, map and decide pages.
import { useEffect, useState } from 'react'
import { subscribeSpots } from '../lib/spots'

export function useSpots() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeSpots(
      (data) => {
        setSpots(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { spots, loading, error }
}
