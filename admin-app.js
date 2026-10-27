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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">عذراً، حدث خطأ ما</h1>
            <button onClick={() => window.location.reload()} className="btn btn-primary mx-auto">تحديث الصفحة</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminApp() {
    const [currentUser, setCurrentUser] = React.useState(() => {
        const saved = sessionStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    React.useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
        }
    }, [currentUser]);

    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center">جاري التحقق...</div>;
    }

    return (
        <div data-name="admin-app" data-file="admin-app.js">
            <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);
