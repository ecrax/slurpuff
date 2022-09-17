import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <>
      <nav className="container p-8 mx-auto navbar justify-between">
        <div>
          <div className="md:hidden">
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/recipes">Recipes</Link>
                </li>
                <li>
                  <Link href="/categories">Categories</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="items-center hidden md:flex">
            <div className="text-xl normal-case btn btn-ghost">
              <Link href="/recipes">recipes</Link>
            </div>
          </div>
        </div>
        <div className="hidden md:flex w-full mx-10 lg:mx-24">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full "
          />
        </div>
        <div className="flex">
          <ul
            tabIndex={0}
            className="menu menu-compact p-2 bg-base-100 rounded-box hidden md:flex"
          >
            <li>
              <Link href="/categories">Categories</Link>
            </li>
          </ul>
          <button className="btn btn-ghost btn-circle md:hidden mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

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
                {/* <li> */}
                {/* <a>Settings</a> */}
                {/* </li> */}
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
        </div>
      </nav>
    </>
  );
};

export default Navbar;
