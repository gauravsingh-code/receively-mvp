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
  
  async request(endpoint , options = {}){
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getToken();

     const config = {
      headers : {
        'Content-Type': 'application/json',
        ...(token ? {Authorization : `Bearer ${token}`} : {}),
        ...options.headers,
      },
      ...options,
     };

     try{
        const response = await fetch(url , config);
        const data = await response.json();

        if(!response.ok){
          //if token expired, clear it and redirect to login
          if(response.status === 401){
            localStorage.removeItem('token');
            window.location.href = '/login';
          } 
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