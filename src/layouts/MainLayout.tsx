/*import Navbar from "../components/Navbar";*/

/* <Navbar />*/


import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <main style={{ padding: "0" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
