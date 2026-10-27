class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'Tahoma, sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>عذراً، حدث خطأ في تحميل الواجهة</h2>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [currentUser, setCurrentUser] = React.useState(() => {
     const saved = sessionStorage.getItem('currentUser');
     return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user) => {
     sessionStorage.setItem('currentUser', JSON.stringify(user));
     if (user.role === 'admin') {
        window.location.href = 'admin.html';
     } else {
        setCurrentUser(user);
     }
  };

  const handleLogout = () => {
     sessionStorage.removeItem('currentUser');
     setCurrentUser(null);
  };

  React.useEffect(() => {
     if (currentUser && currentUser.role === 'admin') {
        window.location.href = 'admin.html';
     }
  }, [currentUser]);

  return (
    <div data-name="app" data-file="app.js">
      {currentUser && currentUser.role !== 'admin' ? (
        currentUser.role === 'transport_manager' ? (
           <TransportManagerDashboard 
             currentUser={currentUser} 
             onLogout={handleLogout} 
           />
        ) : (
           <Dashboard 
             currentUser={currentUser} 
             onLogout={handleLogout} 
           />
        )
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
