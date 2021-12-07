import io from "socket.io-client";

export const SocketHOC =
  (Component) =>
  ({ ...props }) => {
    const socket = io("http://localhost:8090/", {
      auth: { token: localStorage.getItem("token") },
    });
    return <Component {...props} socket={socket} />;
  };
