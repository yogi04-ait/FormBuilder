import './App.css';
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Landing from './Components/Landing';
import Login from './Components/Login';
import Signup from './Components/Signup';
import NotFound from './Components/NotFound';
import Form from "./Components/Form";


function App() {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Signup />,
    },
    {
      path: "/test",
      element: <Form />
    },
    {
      path: "*", // This handles all unmatched routes
      element: <NotFound />,
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
