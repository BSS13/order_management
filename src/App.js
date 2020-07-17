import React from 'react';
import {BrowserRouter as Router,Route,Redirect,Switch} from 'react-router-dom';
import Orders from './views/Orders';

function App() {
  return (
    <div className="App">
       <Router>
       <Switch>
         <Route path="/" exact>
           <Redirect to="/orders"></Redirect>
        </Route>

        <Route path="/orders" exact>
           <Orders />
        </Route>

        <Redirect to="/orders"/>
      </Switch>
      </Router>
    </div>
  );
}

export default App;
