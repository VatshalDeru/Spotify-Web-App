export default function LoginBtn({ loginHandler, loggedIn }){

  return (
    <button style={{color: 'white'}} className='loginBtn' onClick={loginHandler} disabled={loggedIn}>{loggedIn ? 'Logged In' : 'Login'}</button>
  )
}