import React, { useEffect, useState } from "react";

import jwt_decode from "jwt-decode";
import { v4 } from "uuid";

import { useHistory } from "react-router-dom";
import "material-icons/iconfont/material-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Chat = ({ socket }) => {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMesssages] = useState([]);
  const [nameE, setName] = useState("");
  const [admAndUser, setAdmAndUser] = useState("");
  const [allUsersBd, setAllUsersBd] = useState([]);
  const [color, setColor] = useState("");
  const history = useHistory();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token);
      setAdmAndUser(decoded.role);
      setName(decoded.name);
      setColor(decoded.color);

      return;
    }
    history.push("/");
  }, [history]);

  useEffect(() => {
    socket.on("user data", (data) => {
      // console.log(data);
    });
  }, [allUsersBd, socket]);
  const logOut = () => {
    socket.disconnect(true);
    localStorage.removeItem("token");
    history.push("/");
  };
  useEffect(() => {
    socket.on("disconnect", () => {
      localStorage.removeItem("token");
      history.push("/");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  function inputMessageUser(event) {
    setMessageInput(event.target.value);
  }

  function submitMessage(e) {
    e.preventDefault();

    socket.emit("chat message", {
      message: messageInput,

      date: Date.now(),
    });

    setMessageInput("");
  }
  useEffect(() => {
    socket.on("chat message", (data) => {
      setMesssages([...messages, data]);
    });
  }, [messages, socket]);

  const muteOn = (id, mut) => {
    socket.emit("mute", {
      idMute: id,
      mut,
    });
  };

  const banOn = (id, ban) => {
    socket.emit("ban", {
      idBan: id,
      ban,
    });
  };

  return (
    <div className="container">
      <div className="buttons">
        <button
          onClick={() => setActive(true)}
          className="material-icons btnList"
        >
          format_indent_increase
        </button>
        <button
          className="material-icons btnLogOut"
          onClick={() => logOut(nameE)}
        >
          exit_to_app
        </button>
      </div>
      {admAndUser === "ADMIN" ? (
        <div
          className={
            active ? "list-users-modal activeListBlock" : "list-users-modal"
          }
          onClick={() => setActive(false)}
        >
          <div
            className="list-users-block"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(false)}
              className="material-icons activeBtnList"
            >
              format_indent_decrease
            </button>
            <ul className="ul-list-users">
              {allUsersBd
                .filter((user) => user.role !== "ADMIN")
                .map((allUserBd) => {
                  // console.log(allUserBd);
                  return (
                    <li
                      key={v4()}
                      className={
                        allUserBd.online
                          ? "li-list-users active"
                          : "li-list-users"
                      }
                    >
                      <span
                        style={{ color: `${allUserBd.color}` }}
                        className="green-circle-online"
                      >
                        {allUserBd.name}
                      </span>
                      <button
                        className="mute-green"
                        onClick={() => muteOn(allUserBd._id, !allUserBd.mute)}
                      >
                        {allUserBd.mute ? "muteOff " : "muteOn"}
                      </button>
                      <button
                        className="ban-off"
                        onClick={() => banOn(allUserBd._id, !allUserBd.ban)}
                      >
                        {allUserBd.ban ? "banOff " : "banOn"}
                      </button>
                      {/* {allUserBd.mute ? (
                        <button
                          className="mute-green"
                          onClick={() => muteOn(allUserBd._id, !banBtn)}
                        >
                          muteOff
                        </button>
                      ) : (
                        <button
                          className="mute"
                          onClick={() => muteOn(allUserBd._id, true)}
                        >
                          muteOn
                        </button>
                      )}
                      {allUserBd.ban ? (
                        <button
                          className="ban-off"
                          onClick={() => banOn(allUserBd._id, false)}
                        >
                          banOff
                        </button>
                      ) : (
                        <button
                          className="ban"
                          onClick={() => banOn(allUserBd._id, true)}
                        >
                          banOn
                        </button>
                      )} */}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      ) : (
        <div
          className={
            active ? "list-users-modal activeListBlock" : "list-users-modal"
          }
          onClick={() => setActive(false)}
        >
          <div
            className="list-users-block"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(false)}
              className="material-icons activeBtnList"
            >
              format_indent_decrease
            </button>
            <ul className="ul-list-users">
              {allUsersBd
                .filter((user) => user.role !== "ADMIN")
                .map((allUserBd) => {
                  return (
                    <li
                      key={v4()}
                      className={
                        allUserBd.online
                          ? "li-list-users active"
                          : "li-list-users"
                      }
                    >
                      <span
                        style={{ color: `${allUserBd.color}` }}
                        className="green-circle-online"
                      >
                        {allUserBd.name}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      <div className="listMessage">
        <ul className="messages">
          {messages.map((message) => {
            return (
              <li
                style={{
                  background: `${message.color}`,
                }}
                className="rounded mt-2"
                key={v4()}
              >
                <span className="name-user-message">{message.name}:</span>
                <span>{message.message}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <form className="form">
        <div className="name">{nameE}</div>
        <input
          type="text"
          value={messageInput}
          className="input"
          onChange={inputMessageUser}
        />
        <button
          type="submit"
          className="material-icons btn btn-info"
          onClick={submitMessage}
        >
          send
        </button>
      </form>
    </div>
  );
};
export { Chat };
