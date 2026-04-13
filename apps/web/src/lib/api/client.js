// /**
//  * API Client - Fetch wrapper for backend communication
//  */


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  //getToken from localStorage
  getToken(){
    if(typeof window !== 'undefined'){
        return localStorage.getItem('token');
    }
  };

  getRefreshToken(){
    if(typeof window != 'undefined'){
      return localStorage.getItem('refreshToken');
    }
  }

  clearAuthAndRedirect(){
    console.log('Clearing auth and redirecting to login...');
    if(typeof window !== 'undefined'){
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.replace('/login');
    }
  }

  async tryRefreshToken(){
    const refreshToken = this.getRefreshToken();
    if(!refreshToken) {
      console.log('No refresh token available');
      this.clearAuthAndRedirect();
      return false;
    }

    console.log('Attempting to refresh token...');
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
                            method : "POST",
                            headers : {'Content-Type': 'application/json'},
                            body : JSON.stringify({ refreshToken }),
                    });     
      
      if(!response.ok){
        console.log('Refresh failed with status:', response.status);
        this.clearAuthAndRedirect();
        return false;
      }
      
      const data = await response.json();
      console.log('Refresh response:', response.status, data);
      
      if(data.accessToken){
        localStorage.setItem("token", data.accessToken);
        console.log('Token refreshed successfully');
        return true;
      }
    } catch(error){
      console.error('Token refresh failed:', error);
    }

    this.clearAuthAndRedirect();
    return false;
  }
  
  async request(endpoint , options = {}, retryCount = 0){
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getToken();

      // Check if we have a token before making authenticated requests
      if(!token && !endpoint.includes('/auth/')){
        console.error('No authentication token found');
        this.clearAuthAndRedirect();
        throw new Error('Authentication required');
      }

     const config = {
      headers : {
        'Content-Type': 'application/json',
        ...(token ? {Authorization : `Bearer ${token}`} : {}),
        ...options.headers,
      },
      ...options,
     };

     console.log(`API Request: ${options.method || 'GET'} ${url}`, { hasToken: !!token, retryCount });

     try{
        const response = await fetch(url , config);
        
        if(!response.ok){
          if(response.status === 401){
            // Only retry once
            if(retryCount === 0){
              console.log('Got 401, attempting token refresh...');
              const refreshed = await this.tryRefreshToken();
              if(refreshed){
                console.log('Retrying request with new token...');
                return this.request(endpoint, options, 1);
              }
            }
            // If we're here, refresh failed or already retried
            console.log('Authentication failed, redirecting to login');
            this.clearAuthAndRedirect();
            throw new Error('Session expired. Redirecting to login...');
          }
        }
        
        const data = await response.json();
        console.log(`API Response: ${response.status}`, data);

        if(!response.ok){
          throw new Error(data.message || 'API request failed');
        }
        return data;
     }catch(error){
      console.error('Api error: ', error);
      throw error;
     }
  }

  async get(endpoint , options = {}){
    return this.request(endpoint , {method : 'GET', ...options});
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  async health() {
    return this.get('/health');
  }
}

export const api = new ApiClient();
export default api;