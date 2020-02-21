import React, { Component } from 'react';

import Home from '../../components/Home';

export class HomeContainer extends Component {
    render() {
        return (
            <Home
                {...this.props}
            />
        );
    }
}


export default HomeContainer;