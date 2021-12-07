import axios from "axios";

export const registrationApi = async (name, password, history) => {
  try {
    const response = await axios.post("http://localhost:8090/auth/signup", {
      name,
      password,
    });
    let token = response.data.token;

    localStorage.setItem("token", token);
    if (token) {
      history.push("/chat");
    }
    console.log(response.statusText);
  } catch (error) {
    console.log(error.response);
  }
};
