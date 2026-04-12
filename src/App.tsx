import { RouterProvider } from 'react-router-dom'
import { router } from './config/routes'

export function App() {
  return <RouterProvider router={router} />
}
