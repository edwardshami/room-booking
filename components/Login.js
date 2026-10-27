function Login({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isChecking, setIsChecking] = React.useState(false);
  const [checkStatus, setCheckStatus] = React.useState('');
  const [isFirstAdminMode, setIsFirstAdminMode] = React.useState(false);
  const [adminName, setAdminName] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [bootstrapMessage, setBootstrapMessage] = React.useState('');

  const checkIfAdminExists = React.useCallback(async () => {
    try {
      const storeInstance = window.store;
      if (!storeInstance) return;
      const emps = await storeInstance.getEmployees();
      const hasAdmin = emps.some(emp => emp.role === 'admin');
      setIsFirstAdminMode(!hasAdmin);
    } catch (err) {
      console.error('Admin check failed:', err);
    }
  }, []);

  React.useEffect(() => {
    checkIfAdminExists();
  }, [checkIfAdminExists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const storeInstance = window.store;
      if (!storeInstance) {
        throw new Error('قاعدة البيانات غير متصلة');
      }
      
      const user = await storeInstance.authenticate(username, password);
      if (!user) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      onLogin(user);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleCreateFirstAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setBootstrapMessage('');

    if (!adminName.trim() || !adminPassword.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور للمدير الأول');
      return;
    }

    try {
      const storeInstance = window.store;
      if (!storeInstance) {
        throw new Error('قاعدة البيانات غير متصلة');
      }

      const emps = await storeInstance.getEmployees();
      const hasAdmin = emps.some(emp => emp.role === 'admin');
      if (hasAdmin) {
        setIsFirstAdminMode(false);
        return;
      }

      const created = await storeInstance.addEmployee(adminName.trim(), adminPassword.trim(), 'admin', null);
      setBootstrapMessage(`تم إنشاء حساب المدير بنجاح: ${created.name}`);
      setAdminName('');
      setAdminPassword('');
      setIsFirstAdminMode(false);
      setTimeout(() => {
        setBootstrapMessage('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء المدير الأول');
    }
  };

  const runConnectionCheck = async () => {
    setIsChecking(true);
    setCheckStatus('جاري الفحص...');
    try {
      const storeInstance = window.store;
      const emps = await storeInstance.getEmployees();
      setCheckStatus(`OK (الاتصال يعمل - المستخدمون: ${emps.length})`);
    } catch (err) {
      setCheckStatus(`خطأ: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  if (isFirstAdminMode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Tahoma, sans-serif' }}>
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>إنشاء المدير الأول</h2>

          {error && <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '14px' }}>{error}</div>}
          {bootstrapMessage && <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '14px' }}>{bootstrapMessage}</div>}

          <form onSubmit={handleCreateFirstAdmin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4b5563' }}>اسم المدير</label>
              <input 
                type="text" 
                value={adminName} 
                onChange={(e) => setAdminName(e.target.value)} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4b5563' }}>كلمة المرور</label>
              <input 
                type="password" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
            >
              إنشاء المدير الأول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Tahoma, sans-serif' }}>
      <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>تسجيل الدخول</h2>
        
        {error && <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4b5563' }}>اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4b5563' }}>كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit"
            style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
          >
            دخول
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={runConnectionCheck}
            disabled={isChecking}
            style={{ padding: '8px 16px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
          >
            {isChecking ? 'جاري الفحص...' : 'فحص الاتصال'}
          </button>

          {checkStatus && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: checkStatus.startsWith('OK') ? '#d1fae5' : '#fee2e2',
              color: checkStatus.startsWith('OK') ? '#065f46' : '#991b1b',
              fontWeight: 'bold',
              wordBreak: 'break-word'
            }}>
              {checkStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
