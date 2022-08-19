import { NextPage } from "next";
import Error from "next/error";

const FourOhFour: NextPage = () => {
  return <Error statusCode={404} />;
};

export default FourOhFour;
