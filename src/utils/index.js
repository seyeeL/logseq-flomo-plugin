import axios from './axios'

const {get, post} = axios;
export const http = {get, post};

export const loadStatFromFlomo = ({userId, token, cookie, server}) => {
    return http.get(
        `${server}/api/user/${userId}/stat/?tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const fetchTagsFromFlomo = ({token, cookie, server}) => {
    return http.get(
        `${server}/api/tag`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const fetchMemosFromFlomoTag = ({tagName, token, cookie, server}) => {
    return http.get(
        `${server}/api/memo/?tag=${tagName}&tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const getBacklinkedsFromFlomo = ({slug, token, cookie, server}) => {
    return http.get(
        `${server}/api/memo/${slug}?tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};
