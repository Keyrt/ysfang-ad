import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '欢迎', icon: 'dashboard' }
    }]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/table',
    component: Layout,
    redirect: '/table',
    name: 'Table',
    meta: {
      title: '自有CP报表',
      icon: 'nested',
      roles: [3, 4]
    },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'CP结算月报', icon: 'nested', roles: [3, 4] }
      }
    ]
  },
  {

    path: '/tableDay',
    component: Layout,
    redirect: '/tableDay',
    children: [
      {
        path: 'tableDay',
        name: 'tableDay',
        component: () => import('@/views/cpTableDay/index'),
        meta: { title: '每天CP结算汇总报表', icon: 'form', roles: [2] } //暂时隐藏
      }
    ]
  },
  {

    path: '/Monthly',
    component: Layout,
    redirect: '/Monthly',
    children: [
      {
        path: 'Monthly',
        name: 'Monthly',
        component: () => import('@/views/cpMonthly/index'),
        meta: { title: 'cp包月结算', icon: 'list', roles: [3, 4] }
      }
    ]
  },
  {

    path: '/authorList',
    component: Layout,
    redirect: '/authorList',
    children: [
      {
        path: 'authorList',
        name: 'authorList',
        component: () => import('@/views/cpEdit/authorList'),
        meta: { title: '作者列表', icon: 'form', roles: [1] }
      },
      {
        path: '/authorList/bookList/:author',
        name: 'bookList',
        component: () => import('@/views/cpEdit/bookList'),
        meta: { title: '书籍列表', roles: [1] },
        hidden: true
      },
      {
        path: '/authorList/bookEdit/:id',
        name: 'bookEdit',
        component: () => import('@/views/cpEdit/bookEdit'),
        meta: { title: '书籍收益录入', roles: [1] },
        hidden: true
      }
    ]
  },
  {

    path: '/edit',
    component: Layout,
    redirect: '/edit',
    children: [
      {
        path: 'search',
        name: 'search',
        component: () => import('@/views/cpEdit/search'),
        meta: { title: '搜索', icon: 'search', roles: [1] }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
