import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import './App.css';
import Form from './components/Form';
import Notification from './components/notification';
import UserDataMenu from './components/UserDataMenu';
import Hero from './components/Hero';
import LoginBtn from './components/LoginBtn';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { notification } = useSelector(state => state.notification);

  useEffect(()=>{
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const parsedIsLoggedIn = JSON.parse(isLoggedIn);
    setLoggedIn(parsedIsLoggedIn);
  }, []);

  const loginHandler = async () => {
    try {
      const response = await fetch('http://localhost:3000/login');
      const authURL = await response.json();

      // redirects user to spotify login page
      window.location.replace(authURL.URL);
      sessionStorage.setItem('isLoggedIn', 'true');
      setLoggedIn(true)
    } catch (error) {
      throw new Error('Error logging in : ', error);
    };
  };

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/status');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)

        if (data.status === "backend_stopped") {
          console.log('backend stopeed')
          setLoggedIn(false);
          sessionStorage.setItem("isLoggedIn", "false");
          alert("Session expired. The backend stopped.");
          window.location.reload();
        }
    };
    return () => eventSource.close(); // Clean up connection when component unmounts
}, []);
  
  const showTimeouts = () => console.log(currTimeouts)

  /// what you need to do, 
  // reloading the page doesnt log the user out, restarting the server does
  // get the logs in the refreshToken func working

  // function for refreshing tokens
  const refreshTokens = async () => {
    try {
      // Log before fetch
      console.log('token refreshed');
  
      const response = await fetch('http://localhost:3000/refreshTokens');
      console.log(response); // Log response from fetch
  
      // This log should now appear after fetch completes
      console.log('tokens refreshed');
    } catch (error) {
      console.error('Error in refreshTokens:', error);
    }
  };
  
  return (
    <div className="App">
      {notification && <Notification></Notification>}
      <Hero></Hero>
      <Form loggedIn={loggedIn}></Form>
      <LoginBtn loginHandler={loginHandler} loggedIn={loggedIn}></LoginBtn>
      <UserDataMenu />
      {/* <button onClick={showTimeouts}>timeouts</button> */}
      {/* {topArtists && <UsersTopArtists topArtists={topArtists}/>} */}
      {/* <button onClick={fetchToken}>Fetch Access Token</button> */}
    </div>
  );
}

export default App;