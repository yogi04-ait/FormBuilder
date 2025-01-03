import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from './Components/Landing';
import Login from './Components/Login';
import Signup from './Components/Signup';
import NotFound from './Components/NotFound';
import Form from "./Components/Form";
import Workspace from './Components/Workspace';
import Toggle from "./utils/Toggle";
import Settings from "./Components/Settings";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/test" element={<Form />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/toggle" element={<Toggle />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
