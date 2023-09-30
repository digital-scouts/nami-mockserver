# Mockserver für Nami

Access the mockserver at http://localhost:3000 with the sessionStartup endpoint and use 'test' as password and username.

The mockserver will return a session token. Use this token in the header of all other requests.

When accessing the mockserver with different credentials, the request will be forwarded to the real nami server. Please do not use real credentials. The mockserver is not secure.

## Demo

A demo is available at http://vps-zap443284-1.zap-srv.com:3000/

## Requests

Path: /ica/rest/api/1/1/service/nami

1. POST [Url][Path]/auth/manual/sessionStartup

Body (x-www-form-urlencoded):

``` json
{
  "Login": "API",
  "username": "test",
  "password": "test"
}
```

2. GET [Url][Path]/mitglied/filtered-for-navigation/gruppierung/gruppierung/:gruppierungId
2. GET [Url][Path]/mitglied/filtered-for-navigation/gruppierung/gruppierung/:gruppierungId/:memberId
2. GET [Url][Path]/zugeordnete-taetigkeiten/filtered-for-navigation/gruppierung-mitglied/mitglied/:memberId/flist
2. GET [Url][Path]/gruppierungen/filtered-for-navigation/gruppierung/node/1
2. GET [Url]/ica/rest/dashboard/stats/stats