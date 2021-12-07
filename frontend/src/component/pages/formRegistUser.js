import React, { useState } from "react";
import "../../App.css";

import "bootstrap/dist/css/bootstrap.min.css";
import { registrationApi } from "../registrationApi";

function FormRegistUser({ activeBtn, history }) {
  const [nameUser, setNameUser] = useState("");
  const [password, setPassword] = useState("");
  const nicknameChange = (event) => {
    setNameUser(event.target.value);
  };
  const passwordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleSubmit = () => {
    registrationApi(nameUser, password, history);

    setNameUser("");
    setPassword("");
  };
  return (
    <div className="modal-dialog">
      <div className="modal-content border-white">
        <input
          className="form-control mt-2 "
          value={nameUser}
          onChange={nicknameChange}
          placeholder="name"
          type="text"
        />
        <input
          className="form-control mt-2 "
          value={password}
          onChange={passwordChange}
          placeholder="password"
          type="password"
        />
        <button className="btn btn-primary mt-2 " onClick={handleSubmit}>
          Signup
        </button>
      </div>
    </div>
  );
}
export { FormRegistUser };
