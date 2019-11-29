import request from '@/utils/request'

export function fetchAuthorList(query) {
  return request({
    url: '/author/author_list',
    method: 'get',
    params: query
  })
}

export function fetchBookList(query) {
  return request({
    url: '/author/book_update',
    method: 'get',
    params: query
  })
}

// 新增数据
export function createArticle(data) {
  return request({
    url: '/author/book_insert',
    method: 'post',
    data
  })
}

export function fetchIncomeList(query) {
  return request({
    url: '/author/data_list',
    method: 'get',
    params: query
  })
}

export function fetchSearchList(query) {
  return request({
    url: '/author/data_lists',
    method: 'get',
    params: query
  })
}

export function changeIncome(data) {
  return request({
    url: '/author/data_update',
    method: 'post',
    data
  })
}

export function deleteIncome(data) {
  return request({
    url: '/author/data_delete',
    method: 'post',
    data
  })
}