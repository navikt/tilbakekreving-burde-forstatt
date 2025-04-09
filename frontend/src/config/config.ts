export const appConfig = {
    loginUrl: import.meta.env.DEV
        ? 'http://localhost:4000/api/oauth2/login?redirect=/'
        : `https://${window.location.host}/api/oauth2/login?redirect=/`,
};
