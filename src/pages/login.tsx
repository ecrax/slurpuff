import {
  getProviders,
  type LiteralUnion,
  signIn,
  type ClientSafeProvider,
  useSession,
} from "next-auth/react";
import type { NextPage } from "next";
import type { BuiltInProviderType } from "next-auth/providers";
import { useRouter } from "next/router";

const SignIn: NextPage<{
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
}> = ({ providers }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div>Loading...</div>;
  if (session) router.push("/recipes");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {Object.values(providers).map((provider) => (
        <div key={provider.name} className="p-2 border-2 rounded-md">
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

export default SignIn;
