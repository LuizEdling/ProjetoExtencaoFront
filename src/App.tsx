import { useEffect, useState } from "react";
import api from "./services/api.ts";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get<{ message: string }>("/teste")
      .then((res) => setMsg(res.data.message))
      .catch((err: unknown) => console.log(err));
  }, []);

  return (
    <div>
      <h1>{msg}</h1>
    </div>
  );
}

export default App;