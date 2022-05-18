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
export const fetchMemosByOffset = ({token, cookie, server,offset}) => {
    return http.get(
        `${server}/api/memo/?offset=${offset}&tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const fetchAllTags = ({token, cookie, server}) => {
    return http.get(
        `${server}/api/tag`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const fetchMemosByTag = ({tagName, token, cookie, server}) => {
    return http.get(
        `${server}/api/memo/?tag=${tagName}&tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const getBacklinkedMemos = ({slug, token, cookie, server}) => {
    return http.get(
        `${server}/api/memo/${slug}?tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};

export const fetchMemosByDate = ({token, cookie, server, start_date, end_date}) => {
    return http.get(
        `${server}/api/memo/?start_date=${start_date}&end_date=${end_date}&tz=8:0`,
        {
            headers: { fuck_cookie: cookie, "X-XSRF-TOKEN": token },
        }
    );
};
