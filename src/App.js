import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import SessionProvider from './views/SessionProvider';

import Login from './views/Login';
import Creator from './views/Creator';

function App() {
  return (
    <Router>
      <SessionProvider>
        <div className="App">
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/create">
              <Creator />
            </Route>
            <Route path="/">
              <Login />
            </Route>
          </Switch>
        </div>
      </SessionProvider>
    </Router>
  );
}

export default App;
