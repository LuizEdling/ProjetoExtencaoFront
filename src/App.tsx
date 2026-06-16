import { BrowserRouter } from "react-router-dom";
import { AppDialogProvider } from "./context/AppDialogProvider";
import RoutesApp from "./routes";

export default function App() {

  return (
    <BrowserRouter>
      <AppDialogProvider>
        <RoutesApp />
      </AppDialogProvider>
    </BrowserRouter>
  );
}