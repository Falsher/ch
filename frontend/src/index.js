import React from "react";
import ReactDOM from "react-dom";
import { FormRegistUser } from "./component/pages/formRegistUser";

import { Chat } from "./component/pages/chat";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { SocketHOC } from "./HOC/socket.hoc";

const CoolChat = SocketHOC(Chat);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/" component={FormRegistUser}></Route>
        <Route path="/chat" component={CoolChat}></Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
