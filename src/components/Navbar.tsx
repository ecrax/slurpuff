import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session, status } = useSession();

  //if (status === "loading")
  //  return (
  //    <nav className="container px-8 pt-8 mx-auto navbar">
  //      <div>Loading...</div>
  //    </nav>
  //  );

  return (
    <>
      <nav className="container p-8 mx-auto navbar">
        <div className="flex-1">
          <div className="text-xl normal-case btn btn-ghost">
            <Link href="/recipes">recipes</Link>
          </div>
        </div>
        {session ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  src={
                    !session.user?.image ||
                    session.user.image.includes("google")
                      ? `https://avatars.dicebear.com/api/pixel-art/${session.user?.name}.svg`
                      : session.user?.image
                  }
                  alt="Avatar"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href={"/user/me"}>Profile</Link>
              </li>
              <li>
                <Link href="/new">New</Link>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a
                  onClick={() => {
                    signOut();
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <a
            className="btn"
            onClick={() => {
              signIn();
            }}
          >
            log in
          </a>
        )}
      </nav>
    </>
  );
};

export default Navbar;
