export default (baseURL: string) => ({
  email: {
    enabled: true,
    icon: 'envelope',
  },
  portalnesia: {
    enabled: true,
    icon: '',
    key: '',
    secret: '',
    callback: `${baseURL}/portalnesia/callback`,
    scope: ['email','basic','openid'],
    authorize_url: "https://accounts.portalnesia.com/oauth/authorize",
    access_url: "https://accounts.portalnesia.com/oauth/token",
    oauth: 2,
    scope_delimiter: " ",
    token_endpoint_auth_method: "client_secret_basic",
    state: true,
    nonce: true
  },
  google: {
    enabled: false,
    icon: 'google',
    key: '',
    secret: '',
    callback: `${baseURL}/google/callback`,
    scope: ['email'],
  },
});
