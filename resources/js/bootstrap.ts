import axios from 'axios';
import { getCsrfToken } from './utils/csrf';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const csrf = getCsrfToken();
if (csrf) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf;
    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = csrf;
}
