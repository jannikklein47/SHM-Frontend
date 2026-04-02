const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // Assuming you have a layout
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
        name: 'login',
        meta: {
          guestOnly: true,
        },
      },
      {
        path: 'register',
        component: () => import('pages/RegisterPage.vue'),
        name: 'register',
        meta: {
          guestOnly: true,
        },
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        name: 'Dashboard',
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'device/:id',
        component: () => import('pages/DeviceDetailsPage.vue'),
        name: 'Device Details',
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  // Always leave this as last one,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
