import type { ReactNode } from "react";
import Navbar from "./Navbar";

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
