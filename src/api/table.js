import request from '@/utils/request'
import qs from 'qs'

export function fetchList(query) {
  return request({
    url: '/index/index',
    method: 'get',
    params: query
    // paramsSerializer: function(params) {
    //   return qs.stringify(params, { arrayFormat: 'repeat' })
    // }
  })
}

export function fetchListDay(query) {
  return request({
    url: '/index/indexs',
    method: 'get',
    params: query
    // paramsSerializer: function(params) {
    //   return qs.stringify(params, { arrayFormat: 'repeat' })
    // }
  })
}

export function fetchListMonty(query) {
  return request({
    url: '/index/moneybook',
    method: 'get',
    params: query
    // paramsSerializer: function(params) {
    //   return qs.stringify(params, { arrayFormat: 'repeat' })
    // }
  })
}