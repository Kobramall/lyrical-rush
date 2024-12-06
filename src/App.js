import { useEffect, useState } from 'react';
import Home from './pages/home/Home';
import { getTokenOnLoad } from './getToken';

import './App.css';

function App() {

  const [token, setToken] = useState("")
  const [expireTime, setExpireTime] = useState(0)

  useEffect(()=> {
         
    getToken()
  }, [])

  const getToken = async () => {

     try{
      const tokenResponse = await getTokenOnLoad()

      setToken(tokenResponse.access_token)
      setExpireTime(tokenResponse.expires_in)

     }catch(e){
       console.error(e)
     }
  }

  return (
    <div className="App">
       <Home token={token}/>
    </div>
  );
}

export default App;
