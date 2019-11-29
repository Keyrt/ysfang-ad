import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/logon/logon',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/logon/logons',
    method: 'get',
    params: { token }
  })
}
export function modifyPwd(data) {
  return request({
    url: '/index/update_pwd',
    method: 'post',
    data
  })
}
export function logout() {
  return request({
    url: '/logon/tc_token',
    method: 'post'
  })
}
