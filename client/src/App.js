import React, { Fragment } from "react";
import "./App.css";
import Navbar from "../src/components/layout/Navbar";
import Landing from "../src/components/layout/Landing";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "../src/components/auth/Login";
import Register from "../src/components/auth/Register";

const App = () => (
	//IN ORDER FOR ROUTER TO WORK WE HAVE TO PUT EVERYTHING UNDER ROUTER TAG
	<Router>
		<Fragment>
			<Navbar />
			<Route exact path='/' component={Landing} />
			<section className='container'>
				<Switch>
					<Route exact path='/register' component={Register} />
					<Route exact path='/login' component={Login} />
				</Switch>
			</section>
		</Fragment>
	</Router>
);

export default App;
