import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
      <h2 style={{ margin: '0 0 1rem 0' }}>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link 
        to="/" 
        style={{ 
          marginTop: '1.5rem', 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#1d6e53ff', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}
      >
        Go to Homepage
      </Link>
    </div>
  );
}