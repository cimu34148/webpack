import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import Header from '@com/Header';
import MenuLeft from '@com/MenuLeft';
import Content from './Content';

class App extends Component {
    constructor(props) {
        super(props)
    }
    componentWillMount() {
        if(!localStorage.getItem('token')) {
            this.props.history.push('/login')
        } else {
            this.props.history.push('/vip')
        }
    }

    render() {
        return (
            <div id="views">
                <Header name="home"></Header>
                <div id="box">
                    <MenuLeft></MenuLeft>
                    <Content></Content>
                </div>
            </div>
        );
    }
}


export default hot(App);