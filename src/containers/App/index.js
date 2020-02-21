import React from 'react';
import { withRouter, Switch } from 'react-router-dom';

import PublicRoute from '../../routes/PublicRoute';
import Home from '../Home/HomeContainer'

const App = () =>(
    <React.Fragment>
        <Switch>
            <PublicRoute exact path='/' component={Home}/>
        </Switch>
    </React.Fragment>
);
export default withRouter(App);