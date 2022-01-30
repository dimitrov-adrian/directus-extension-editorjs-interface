import { AxiosInstance } from 'axios';

export default function useDirectusToken(directusApi: AxiosInstance) {
	return {
		addQueryToPath,
		getToken,
		addTokenToURL,
	};

	function addQueryToPath(path: string, query: Record<string, any>) {
		const queryParams = [];

		for (const [key, value] of Object.entries(query)) {
			queryParams.push(`${key}=${value}`);
		}

		return path.includes('?') ? `${path}&${queryParams.join('&')}` : `${path}?${queryParams.join('&')}`;
	}

	function getToken() {
		return (
			directusApi.defaults?.headers?.['Authorization']?.split(' ')[1] ||
			directusApi.defaults?.headers?.common?.['Authorization']?.split(' ')[1] ||
			null
		);
	}

	function addTokenToURL(url: string, token: string) {
		const accessToken = token || getToken();
		if (!accessToken) return url;
		return addQueryToPath(url, {
			access_token: accessToken,
		});
	}
}
