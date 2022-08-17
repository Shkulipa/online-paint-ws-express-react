import SettingBar from './components/settingBar';
import Toolbar from './components/toolbar';
import Canvas from './components/canvas';
import './styles/app.scss';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className='app'>
        <Switch>
          <Route path='/:id'>
            <Toolbar />
            <SettingBar/>
            <Canvas />
          </Route>
          <Redirect to={`f${(+new Date()).toString(16)}`} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
 