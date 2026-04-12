import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/preview',
    lazy: () =>
      import('../pages/PreviewPage').then((m) => ({
        Component: m.PreviewPage,
      })),
  })
}

export const router = createBrowserRouter(routes)
