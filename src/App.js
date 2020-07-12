import React from 'react';
import {BrowserRouter as Router,Route,Redirect,Switch} from 'react-router-dom';
import Orders from './views/Orders';

function App() {
  return (
    <div className="App">
       <Router>
       <Switch>
         <Route path="/" exact>
           <Orders />
        </Route>

        <Redirect to="/"/>
      </Switch>
      </Router>
    </div>
  );
}

export default App;
