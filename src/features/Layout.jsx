import { Outlet } from "react-router-dom";
import NavBar from "./layout/NavBar";
import MainContent from "./layout/MainContent";
import SideBar from "./layout/SideBar";

const Layout = () => {
  return (
    <div className="flex flex-col items-center max-h-screen h-screen">
      <NavBar />
      {/* <div className="drawer drawer-mobile"> */}
        <MainContent>
          <Outlet />
        </MainContent>
        {/* <SideBar /> */}
      {/* </div> */}

    </div>
  );
};

export default Layout;
