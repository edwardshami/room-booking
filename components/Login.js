function Login({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isChecking, setIsChecking] = React.useState(false);
  const [checkStatus, setCheckStatus] = React.useState('');

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



