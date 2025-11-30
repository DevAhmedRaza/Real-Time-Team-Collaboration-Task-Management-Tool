(function () {
  const { useState, useEffect, useRef } = React;
  const API_BASE = 'http://localhost:5000';
  const socket = io(API_BASE);

  function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') };
  }

  async function loginAPI(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    return res.json();
  }
  async function registerAPI(name, email, password) {
    const res = await fetch(`${API_BASE}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    return res.json();
  }
  async function meAPI() { const res = await fetch(`${API_BASE}/api/users/me`, { headers: authHeaders() }); return res.json(); }
  async function getTeamsAPI() { const res = await fetch(`${API_BASE}/api/teams`, { headers: authHeaders() }); return res.json(); }
  async function createTeamAPI(name, description) { const res = await fetch(`${API_BASE}/api/teams`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, description }) }); return res.json(); }
  async function getTasksForTeamAPI(teamId) { const res = await fetch(`${API_BASE}/api/tasks/team/${teamId}`, { headers: authHeaders() }); return res.json(); }
  async function createTaskAPI(payload) { const res = await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) }); return res.json(); }
  async function updateTaskAPI(id, updates) { const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(updates) }); return res.json(); }
  async function getUsersAPI() { const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() }); return res.json(); }

  function App() {
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selected, setSelected] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
      // if token exists, fetch me and teams
      const token = localStorage.getItem('token');
      if (token) {
        meAPI().then((u) => { if (u && u._id) { setUser(u); } });
        getUsersAPI().then((res) => setUsers(res || []));
        getTeamsAPI().then((res) => setTeams(res || []));
      }
      socket.on('connect', () => console.log('Connected to socket', socket.id));
      socket.on('taskUpdated', (data) => {
        if (selected && data.teamId === selected._id) {
          loadTasks(selected._id);
        }
      });
      socket.on('newMessage', (data) => {
        if (selected && data.teamId === selected._id) {
          setMessages((m) => [...m, data]);
        }
      });
    }, []);

    const loadTeams = async () => { const t = await getTeamsAPI(); setTeams(t || []); };

    const loadTasks = async (teamId) => {
      const t = await getTasksForTeamAPI(teamId);
      setTasks(t || []);
    };

    useEffect(() => {
      if (selected) {
        // join team room
        setMessages([]);
        socket.emit('joinTeam', { teamId: selected._id, userId: user?._id });
        loadTasks(selected._id);
      }
    }, [selected]);

    const onLogin = async (email, password) => {
      const res = await loginAPI(email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        setTeams(await getTeamsAPI());
        setUsers(await getUsersAPI());
      } else {
        alert(res.message || 'Login failed');
      }
    };

    const onRegister = async (name, email, password) => {
      const res = await registerAPI(name, email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        setTeams(await getTeamsAPI());
        setUsers(await getUsersAPI());
      } else {
        alert(res.message || 'Registration failed');
      }
    };

    const onCreateTeam = async (name, description) => {
      const res = await createTeamAPI(name, description);
      setTeams((s) => [...s, res]);
    };

    const onCreateTask = async (payload) => {
      const res = await createTaskAPI(payload);
      await loadTasks(payload.team);
      socket.emit('taskUpdated', { teamId: payload.team });
    };

    const onMoveTask = async (taskId, status) => {
      const res = await updateTaskAPI(taskId, { status });
      await loadTasks(selected._id);
      socket.emit('taskUpdated', { teamId: selected._id });
    };

    const onSendMessage = () => {
      const msg = { text: messageInput, user: user || { name: 'Unknown' }, teamId: selected._id, id: Date.now() };
      setMessages((m) => [...m, msg]);
      socket.emit('newMessage', msg);
      setMessageInput('');
    };

    if (!user) return React.createElement(Auth, { onLogin, onRegister });

    return React.createElement('div', null,
      React.createElement('div', { className: 'header' },
        React.createElement('div', null, React.createElement('strong', null, 'TeamCollab'), ' - Real-time Tasks & Chat'),
        React.createElement('div', null, 'Logged in as ', React.createElement('strong', null, user.name), ' ', React.createElement('button', { className: 'btn', onClick: () => { localStorage.removeItem('token'); setUser(null); } }, 'Logout'))
      ),
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'space-between' },
          React.createElement('div', null,
            React.createElement('h3', null, 'Your Teams'),
            React.createElement('ul', null, teams.map(t => React.createElement('li', { key: t._id },
              React.createElement('button', { onClick: () => setSelected(t), className: 'btn small' }, t.name)
            )))
          ),
          React.createElement('div', null,
            React.createElement(TeamCreate, { onCreateTeam })
          )
        ),
        selected ? React.createElement('div', { className: 'flex' },
          React.createElement('div', null,
            React.createElement('h2', null, selected.name),
            React.createElement(Board, { tasks, onMoveTask, users, onCreateTask, teamId: selected._id })
          ),
          React.createElement('div', { className: 'chat' },
            React.createElement('h4', null, 'Team Chat'),
            React.createElement('div', { style: { height: '300px', overflowY: 'auto', background: '#fff', padding: 8 } },
              messages.map(m => React.createElement('div', { key: m.id, style: { borderBottom: '1px solid #eee', padding: 6 } }, React.createElement('strong', null, m.user?.name || 'User'), ': ', m.text))
            ),
            React.createElement('div', { className: 'form' },
              React.createElement('input', { className: 'input', value: messageInput, onChange: e => setMessageInput(e.target.value) }),
              React.createElement('button', { className: 'btn', onClick: onSendMessage }, 'Send')
            )
          )
        ) : React.createElement('div', null, React.createElement('p', null, 'Select a team from the list to start working'))
      )
    );
  }

  function Auth({ onLogin, onRegister }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    return React.createElement('div', null,
      React.createElement('div', { className: 'header' }, React.createElement('strong', null, 'TeamCollab')), 
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'form' },
          mode === 'register' && React.createElement('div', null, React.createElement('input', { placeholder: 'Name', className: 'input', value: name, onChange: e => setName(e.target.value) })),
          React.createElement('input', { placeholder: 'Email', className: 'input', value: email, onChange: e => setEmail(e.target.value) }),
          React.createElement('input', { placeholder: 'Password', className: 'input', value: password, onChange: e => setPassword(e.target.value), type: 'password' }),
          React.createElement('button', { className: 'btn', onClick: () => { if (mode === 'login') onLogin(email, password); else onRegister(name, email, password); } }, mode === 'login' ? 'Login' : 'Register'),
          React.createElement('button', { className: 'btn', style: { background: '#aaaaaa' }, onClick: () => setMode(mode === 'login' ? 'register' : 'login') }, mode === 'login' ? 'Switch to Register' : 'Switch to Login')
        )
      )
    );
  }

  function TeamCreate({ onCreateTeam }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    return React.createElement('div', { className: 'form' },
      React.createElement('input', { className: 'input', placeholder: 'Team name', value: name, onChange: e => setName(e.target.value) }),
      React.createElement('input', { className: 'input', placeholder: 'Description', value: desc, onChange: e => setDesc(e.target.value) }),
      React.createElement('button', { className: 'btn', onClick: () => { if (!name) return alert('Name required'); onCreateTeam(name, desc); setName(''); setDesc(''); } }, 'Create Team')
    );
  }

  function Board({ tasks, onMoveTask, users, onCreateTask, teamId }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [assignee, setAssignee] = useState('');

    const grouped = { todo: [], inprogress: [], done: [] };
    tasks.forEach(t => grouped[t.status || 'todo'].push(t));

    return React.createElement('div', null,
      React.createElement('div', { className: 'form' },
        React.createElement('input', { className: 'input', placeholder: 'Task title', value: title, onChange: e => setTitle(e.target.value) }),
        React.createElement('select', { className: 'input', value: assignee, onChange: e => setAssignee(e.target.value) }, React.createElement('option', { value: '' }, 'Assign to'), users.map(u => React.createElement('option', { key: u._id, value: u._id }, u.name))),
        React.createElement('button', { className: 'btn', onClick: async () => {
          if (!title) return alert('Title required');
          const payload = { title, description: desc, team: teamId, assignees: assignee ? [assignee] : [] };
          await onCreateTask(payload);
          setTitle(''); setDesc(''); setAssignee('');
        } }, 'Add Task')
      ),
      React.createElement('div', { className: 'board' },
        ['todo', 'inprogress', 'done'].map(col => React.createElement('div', { key: col, className: 'column' },
          React.createElement('h4', null, col.toUpperCase()),
          grouped[col].map(t => React.createElement('div', { key: t._id, className: 'card' },
            React.createElement('div', null, React.createElement('strong', null, t.title)),
            React.createElement('div', { className: 'small' }, 'Assignees: ', (t.assignees || []).map(a => a.name).join(', ')),
            React.createElement('div', { style: { marginTop: 8 } },
              col !== 'todo' && React.createElement('button', { className: 'btn small', onClick: () => onMoveTask(t._id, 'todo') }, 'Move to To Do'),
              col !== 'inprogress' && React.createElement('button', { className: 'btn small', onClick: () => onMoveTask(t._id, 'inprogress') }, 'Move to In Progress'),
              col !== 'done' && React.createElement('button', { className: 'btn small', onClick: () => onMoveTask(t._id, 'done') }, 'Move to Done')
            )
          ))
        ))
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();