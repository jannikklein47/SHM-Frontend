const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // Assuming you have a layout
    children: [
      { path: '', component: () => import('pages/UserSelectPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'device/:id', component: () => import('pages/DeviceDetailsPage.vue') },
    ],
  },
  // Always leave this as last one,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
